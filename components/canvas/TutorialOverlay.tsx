"use client";

/**
 * TutorialOverlay - Interactive onboarding tutorial
 * 
 * Features:
 * - Full screen blur backdrop
 * - Step-by-step instructions
 * - Animated arrows pointing to UI areas
 * - Progress indicator
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
};

// Tutorial steps for Oil & Gas sector
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetArea: "task" | "components" | "build" | "timer" | "submit" | "center";
  arrowDirection: "left" | "right" | "up" | "down" | "none";
}

export const OIL_GAS_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Oil & Gas Simulation",
    description: "Arrange 7 components in the correct sequence to build a complete oil & gas production chain.",
    targetArea: "center",
    arrowDirection: "none",
  },
  {
    id: "task",
    title: "Task Panel",
    description: "View your progress here: components placed, wrong attempts, and current objective.",
    targetArea: "task",
    arrowDirection: "left",
  },
  {
    id: "timer",
    title: "Timer",
    description: "Complete the task before time runs out. The ring turns yellow when 30 seconds remain.",
    targetArea: "timer",
    arrowDirection: "left",
  },
  {
    id: "components",
    title: "Components Toolbox",
    description: "Drag components from here to the canvas. Place them in the correct order.",
    targetArea: "components",
    arrowDirection: "left",
  },
  {
    id: "build",
    title: "Canvas Area",
    description: "Drop components here. When placed correctly, pipes will connect automatically.",
    targetArea: "build",
    arrowDirection: "right",
  },
  {
    id: "submit",
    title: "Submit or Reset",
    description: "Click Submit when done. Use Reset to start over if needed.",
    targetArea: "submit",
    arrowDirection: "left",
  },
];

// Get tutorial steps by sector
export function getTutorialSteps(sector: string): TutorialStep[] {
  const normalizedSector = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
  
  switch (normalizedSector) {
    case "oilgas":
    case "oil&gas":
      return OIL_GAS_TUTORIAL_STEPS;
    // Add more sectors here as needed
    default:
      return OIL_GAS_TUTORIAL_STEPS; // Default to oil & gas for now
  }
}

interface TutorialOverlayProps {
  sector: string;
  onComplete: () => void;
}

export function TutorialOverlay({ sector, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getTutorialSteps(sector);
  const step = steps[currentStep];
  const stepsLength = steps.length;

  const handleNext = () => {
    if (currentStep < stepsLength - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Get position for spotlight cutout based on target area (in pixels for clip-path)
  // OilGasFlowCanvas Layout: p-4 (16px padding), left column w-80 (320px), gap-4 (16px gap)
  // LEFT PANEL: Task Panel (header ~56px + content ~280px = ~336px total) + Components Toolbox (flex-1)
  // RIGHT: Canvas area (flex-1, starts at 352px from left)
  const getSpotlightArea = (target: TutorialStep["targetArea"]): { x: number; y: number; width: number; height: number } | null => {
    switch (target) {
      case "task":
        // Task panel: top-left, contains header + progress + stats + buttons
        return { x: 16, y: 16, width: 320, height: 340 };
      case "timer":
        // Timer is in the Task Panel header, right side (inside the px-4 py-3 header)
        return { x: 248, y: 26, width: 78, height: 44 };
      case "components":
        // Components Toolbox: below Task Panel with gap-4 (16px)
        // Starts at y = 16 (padding) + 340 (task panel) + 16 (gap) = 372px
        return { x: 16, y: 372, width: 320, height: 400 };
      case "build":
        // Canvas area: right side, starts at x = 16 + 320 + 16 = 352px
        return { x: 352, y: 16, width: 1200, height: 800 };
      case "submit":
        // Submit button is inside Task Panel, at the bottom (in the flex gap-2 buttons area)
        // Approximately at y = 16 + 280 = 296px, right side of the buttons area
        return { x: 178, y: 296, width: 148, height: 36 };
      case "center":
      default:
        return null;
    }
  };

  const spotlight = getSpotlightArea(step.targetArea);
  const hasSpotlight = spotlight !== null;

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Dark overlay with cutout - uses SVG mask for the hole */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible overlay, Black = transparent hole */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {hasSpotlight && (
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={step.targetArea === "build" ? "calc(100% - 368px)" : spotlight.width}
                height={step.targetArea === "build" || step.targetArea === "components" ? "calc(100% - 32px)" : spotlight.height}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        
        {/* The actual overlay with mask applied */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(46, 48, 147, 0.92)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight glow border */}
      {hasSpotlight && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: spotlight.x,
            top: spotlight.y,
            width: step.targetArea === "build" ? "calc(100vw - 368px)" : spotlight.width,
            height: step.targetArea === "build" ? "calc(100vh - 32px)" : 
                   step.targetArea === "components" ? "calc(100vh - 408px)" : spotlight.height,
            borderRadius: "16px",
            border: `3px solid ${BRAND.yellow}`,
            boxShadow: `0 0 30px ${BRAND.yellow}80, 0 0 60px ${BRAND.yellow}40`,
            zIndex: 2,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Animated pointing arrow */}
      {hasSpotlight && step.arrowDirection !== "none" && (
        <motion.div
          className="absolute pointer-events-none z-[110]"
          style={{
            // Position arrow next to spotlight, pointing toward it
            left: step.arrowDirection === "left" ? `${spotlight.x + spotlight.width + 16}px` : "auto",
            right: step.arrowDirection === "right" ? `calc(100vw - ${spotlight.x - 16}px)` : "auto",
            top: step.targetArea === "timer" ? `${spotlight.y + spotlight.height / 2}px` : 
                 step.targetArea === "task" ? `${spotlight.y + spotlight.height / 2}px` :
                 step.targetArea === "components" ? "60vh" :
                 step.targetArea === "submit" ? `${spotlight.y + spotlight.height / 2}px` :
                 step.targetArea === "build" ? "50vh" : "50vh",
            transform: "translateY(-50%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: step.arrowDirection === "left" ? [0, -10, 0] : 
               step.arrowDirection === "right" ? [0, 10, 0] : 0,
          }}
          transition={{ 
            opacity: { duration: 0.3 },
            x: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{
              // Arrow points LEFT (toward the spotlight on left side)
              transform: step.arrowDirection === "right" ? "rotate(180deg)" : "none",
              filter: `drop-shadow(0 0 10px ${BRAND.yellow})`,
            }}
          >
            <path 
              d="M19 12H5M5 12L12 5M5 12L12 19" 
              stroke={BRAND.yellow} 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}

      {/* Instruction card - centered in remaining space */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[105]"
        style={{
          // Shift card away from spotlight area
          paddingLeft: step.targetArea === "task" || step.targetArea === "components" || step.targetArea === "timer" || step.targetArea === "submit" ? "420px" : "0",
          paddingRight: step.targetArea === "build" ? "calc(100vw - 320px)" : "0",
        }}
      >
        <motion.div
          className="w-full max-w-md mx-4 pointer-events-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: BRAND.white,
            boxShadow: `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px ${BRAND.blue}30`,
          }}
        >
          {/* Header with step indicator */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${BRAND.blue}20` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${BRAND.yellow}20` }}
              >
                <span className="text-lg font-bold" style={{ color: BRAND.indigo }}>
                  {currentStep + 1}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: `${BRAND.indigo}80` }}>
                  Step {currentStep + 1} of {steps.length}
                </p>
                <div className="flex gap-1 mt-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-1 rounded-full transition-all"
                      style={{
                        background: i <= currentStep ? BRAND.yellow : `${BRAND.blue}30`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100"
              style={{ color: `${BRAND.indigo}60` }}
            >
              Skip Tutorial
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: BRAND.indigo }}
                >
                  {step.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${BRAND.indigo}90` }}
                >
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer with navigation */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: `${BRAND.blue}08` }}
          >
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{
                color: BRAND.indigo,
                background: currentStep > 0 ? `${BRAND.blue}15` : "transparent",
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105"
              style={{
                background: BRAND.yellow,
                color: BRAND.indigo,
                boxShadow: `0 4px 12px ${BRAND.yellow}50`,
              }}
            >
              {currentStep === steps.length - 1 ? "Start Building!" : "Next"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Oil & Gas specific decoration */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
            style={{
              background: BRAND.indigo,
              color: BRAND.yellow,
              boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 2c-4 6-8 10-8 14a8 8 0 1016 0c0-4-4-8-8-14z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Oil & Gas Processing
          </div>
        </motion.div>
      </motion.div>
      </div>
    </motion.div>
  );
}
