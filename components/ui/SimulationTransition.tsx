"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SimulationTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

// Generate circuit nodes
const generateNodes = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 0.6,
    size: Math.random() * 4 + 2,
  }));
};

// Generate connection lines
const generateLines = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x1: Math.random() * 100,
    y1: Math.random() * 100,
    angle: Math.random() * 360,
    length: Math.random() * 150 + 50,
    delay: Math.random() * 0.8,
  }));
};

export function SimulationTransition({ isActive, onComplete }: SimulationTransitionProps) {
  const nodes = useMemo(() => generateNodes(30), []);
  const lines = useMemo(() => generateLines(20), []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={onComplete}
          onAnimationComplete={(definition) => {
            if (definition === "animate") {
              setTimeout(onComplete, 1500);
            }
          }}
          style={{ backgroundColor: "#0a4d8c" }}
        >
          {/* Blueprint grid - engineering style */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(250, 228, 82, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(250, 228, 82, 0.08) 1px, transparent 1px),
                linear-gradient(rgba(250, 228, 82, 0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(250, 228, 82, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
            }}
          />

          {/* Circuit connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {lines.map((line) => (
              <motion.line
                key={`line-${line.id}`}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x1 + Math.cos(line.angle * Math.PI / 180) * (line.length / 10)}%`}
                y2={`${line.y1 + Math.sin(line.angle * Math.PI / 180) * (line.length / 10)}%`}
                stroke="#FAE452"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 0.8, delay: line.delay }}
              />
            ))}
          </svg>

          {/* Circuit nodes */}
          <div className="absolute inset-0 overflow-hidden">
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                className="absolute rounded-sm"
                style={{
                  left: `${node.left}%`,
                  top: `${node.top}%`,
                  width: node.size,
                  height: node.size,
                  backgroundColor: "#FAE452",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.6, 0.3], scale: 1 }}
                transition={{ duration: 0.5, delay: node.delay }}
              />
            ))}
          </div>

          {/* Horizontal scan lines - technical readout */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] pointer-events-none"
            style={{ backgroundColor: "rgba(250, 228, 82, 0.4)" }}
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Center content - Engineering HUD style */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Technical frame */}
            <div 
              className="relative px-12 py-8 border"
              style={{ 
                borderColor: "rgba(250, 228, 82, 0.4)",
                backgroundColor: "rgba(46, 48, 147, 0.8)",
              }}
            >
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "#FAE452" }} />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "#FAE452" }} />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "#FAE452" }} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "#FAE452" }} />

              {/* Header label */}
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 text-xs tracking-widest"
                style={{ 
                  backgroundColor: "#0a4d8c",
                  color: "#FAE452",
                  border: "1px solid rgba(250, 228, 82, 0.4)",
                }}
              >
              </motion.div>

              {/* Main title */}
              <motion.h2
                className="text-2xl font-light tracking-[0.15em] uppercase mb-4"
                style={{ color: "#ffffff" }}
              >
                Simulation Environment
              </motion.h2>

              {/* Status rows */}
              <div className="space-y-2 text-left text-sm font-mono" style={{ color: "rgba(250, 228, 82, 0.9)" }}>
                <StatusRow label="SYSTEM" value="INITIALIZING" delay={0.3} />
                <StatusRow label="MODULE" value="CHEMTECH 2026" delay={0.5} />
                <StatusRow label="STATUS" value="LOADING..." delay={0.7} isAnimated />
              </div>
              
              {/* Loading bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                  <span>PROGRESS</span>
                  <span>100%</span>
                </div>
                <motion.div
                  className="h-2 w-full overflow-hidden"
                  style={{ 
                    backgroundColor: "rgba(250, 228, 82, 0.1)",
                    border: "1px solid rgba(250, 228, 82, 0.3)",
                  }}
                >
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: "#FAE452" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.3, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              {/* Tap to continue hint */}
              <motion.p
                className="mt-6 text-xs tracking-wider"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0.3] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity }}
              >
                TAP ANYWHERE TO CONTINUE
              </motion.p>
            </div>
          </motion.div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(20, 20, 60, 0.6) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Status row component
interface StatusRowProps {
  label: string;
  value: string;
  delay: number;
  isAnimated?: boolean;
}

function StatusRow({ label, value, delay, isAnimated }: StatusRowProps) {
  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>{label}:</span>
      {isAnimated ? (
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {value}
        </motion.span>
      ) : (
        <span>{value}</span>
      )}
    </motion.div>
  );
}

export default SimulationTransition;
