"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SECTORS, ANIMATION } from "@/lib/constants";
import { getUserData, updateUserSector, calculateWheelRotation } from "@/lib/utils";
import {
  SectorWheel,
  SectorLegend,
  BlinkDetector,
} from "@/components";

// Background component matching splash/login screens
function WaveBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: "#2A6BB5" }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Blueprint circles */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.1]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circles" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="3" fill="white" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.3" />
            <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circles)" />
      </svg>
      
      {/* Floating gear outlines */}
      <motion.svg 
        className="absolute opacity-[0.12]" 
        style={{ top: "15%", right: "10%", width: "120px", height: "120px" }}
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <path 
          d="M50 20 L53 30 L60 28 L58 38 L68 42 L62 50 L68 58 L58 62 L60 72 L53 70 L50 80 L47 70 L40 72 L42 62 L32 58 L38 50 L32 42 L42 38 L40 28 L47 30 Z" 
          fill="none" 
          stroke="white" 
          strokeWidth="1"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="1" />
      </motion.svg>
      
      <motion.svg 
        className="absolute opacity-[0.1]" 
        style={{ bottom: "20%", left: "8%", width: "80px", height: "80px" }}
        viewBox="0 0 100 100"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <path 
          d="M50 15 L54 28 L65 24 L62 37 L75 43 L65 50 L75 57 L62 63 L65 76 L54 72 L50 85 L46 72 L35 76 L38 63 L25 57 L35 50 L25 43 L38 37 L35 24 L46 28 Z" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.8"
        />
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.8" />
      </motion.svg>
      
      {/* Technical measurement marks */}
      <div className="absolute top-0 left-0 right-0 h-8 opacity-[0.12] flex justify-around items-end">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-px bg-white" style={{ height: i % 5 === 0 ? "16px" : "8px" }} />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.12] flex justify-around items-start">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-px bg-white" style={{ height: i % 5 === 0 ? "16px" : "8px" }} />
        ))}
      </div>
      
      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-white opacity-[0.15]" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-white opacity-[0.15]" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-white opacity-[0.15]" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-white opacity-[0.15]" />
      
      {/* Animated gradient waves */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(42, 107, 181, 0.6) 0%, transparent 60%)",
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 10% 90%, rgba(42, 107, 181, 0.5) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.5, 0.3, 0.5],
          x: [0, 50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 90% 45% at 90% 85%, rgba(42, 107, 181, 0.5) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          x: [0, -40, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Aurora effect - top */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 120% 30% at 50% -10%, rgba(42, 107, 181, 0.4) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      
      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(20, 20, 60, 0.4) 100%)",
        }}
      />
    </div>
  );
}

type PagePhase = "intro" | "wheel";

export default function SectorWheelPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Intro phase state
  const [phase, setPhase] = useState<PagePhase>("intro");
  const [displayText, setDisplayText] = useState("");
  const [showChoice, setShowChoice] = useState(false);
  const [showSectors, setShowSectors] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const typingText = "Every engineer begins with a";

  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      router.push("/");
      return;
    }
    setUserName(userData.name);
  }, [router]);

  // Typing effect for intro
  useEffect(() => {
    if (phase !== "intro") return;

    const startDelay = setTimeout(() => {
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < typingText.length) {
          setDisplayText(typingText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // After typing complete, fade in "choice"
          setTimeout(() => {
            setShowChoice(true);
            // Show sectors after choice
            setTimeout(() => {
              setShowSectors(true);
              // Show subtitle after sectors
              setTimeout(() => {
                setShowSubtitle(true);
                // Show continue after subtitle
                setTimeout(() => {
                  setShowContinue(true);
                }, 1000);
              }, 1200);
            }, 1000);
          }, 300);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }, 500);

    return () => clearTimeout(startDelay);
  }, [phase]);

  // Transition to wheel phase
  const handleContinue = () => {
    setPhase("wheel");
  };

  const spinWheel = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);

    const sectorIndex = Math.floor(Math.random() * SECTORS.length);
    const totalRotation = calculateWheelRotation(
      rotation,
      sectorIndex,
      SECTORS.length,
      ANIMATION.minRotations,
      ANIMATION.maxRotations
    );

    setRotation(totalRotation);

    setTimeout(async () => {
      setSelectedSector(SECTORS[sectorIndex].name);
      setIsSpinning(false);
      setShowResult(true);
      await updateUserSector(SECTORS[sectorIndex].name);
    }, ANIMATION.wheelSpinDuration);
  }, [isSpinning, rotation]);

  const proceedToSimulation = () => {
    router.push("/simulation");
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {/* INTRO PHASE - Statement */}
      {phase === "intro" && (
        <motion.div
          key="intro"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer"
          onClick={showContinue ? handleContinue : undefined}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <WaveBackground />

          {/* Statement text */}
          <motion.div
            className="relative z-10 text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className="text-2xl md:text-4xl tracking-tight"
              style={{ 
                color: "#ffffff",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
              }}
            >
              {displayText}
              {!showChoice && displayText.length > 0 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ color: "#FAE452" }}
                >
                  |
                </motion.span>
              )}
              {showChoice && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  {" "}<span style={{ color: "#FAE452", fontWeight: 600 }}>choice</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    style={{ color: "#FAE452" }}
                  >.</motion.span>
                </motion.span>
              )}
            </h1>

            {/* Sectors list */}
            {showSectors && (
              <motion.p
                className="mt-8 text-lg md:text-xl font-light tracking-wide"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <span style={{ color: "#FAE452" }}>Process</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>Electrical</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>HVAC</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>Oil & Gas</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>MEP</span>
              </motion.p>
            )}

            {/* Subtitle */}
            {showSubtitle && (
              <motion.p
                className="mt-4 text-sm md:text-base font-light"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
              >
                Each path shapes the world differently.
              </motion.p>
            )}

            {/* Tap to continue */}
            {showContinue && (
              <motion.div
                className="mt-12 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    style={{ opacity: 0.5 }}
                  >
                    <path 
                      d="M18 15L12 9L6 15" 
                      stroke="#FAE452" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <motion.p
                  className="text-xs tracking-widest"
                  style={{ color: "rgba(250, 228, 82, 0.5)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Tap anywhere to continue
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* WHEEL PHASE */}
      {phase === "wheel" && (
        <motion.div
          key="wheel"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <WaveBackground />

          <div className="relative z-10 text-center">
            {/* Header - hide after result */}
            {!showResult && <WelcomeHeader userName={userName} />}

            <SectorWheel rotation={rotation} />

            {/* Blink detector for spin control */}
            {!showResult && (
              <div className="mt-4">
                <BlinkDetector onBlink={spinWheel} disabled={isSpinning} />
              </div>
            )}

            {/* Result - inline fade in, no popup */}
            {showResult && selectedSector && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-2"
              >
                {/* Sector name */}
                <motion.h2
                  className="text-3xl md:text-4xl tracking-tight mb-2"
                  style={{ 
                    color: "#FAE452",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {selectedSector}
                </motion.h2>

                {/* One-line meaning */}
                <motion.p
                  className="text-sm font-light tracking-wide mb-8"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  {SECTORS.find(s => s.name === selectedSector)?.description &&
                    `Build and design ${SECTORS.find(s => s.name === selectedSector)?.description}.`}
                </motion.p>

                {/* Continue CTA */}
                <motion.button
                  onClick={proceedToSimulation}
                  className="px-10 py-4 rounded-full text-sm tracking-wider font-medium transition-all duration-300"
                  style={{
                    background: "#FAE452",
                    color: "#2E3093",
                    boxShadow: "0 8px 32px rgba(250, 228, 82, 0.4)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 12px 40px rgba(250, 228, 82, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  CONTINUE
                </motion.button>
              </motion.div>
            )}

            {/* Legend - only show before result */}
            {!showResult && <SectorLegend />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

interface WelcomeHeaderProps {
  userName: string;
}

function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <>
      <h1 
        className="text-2xl md:text-3xl mb-2 tracking-tight" 
        style={{ 
          color: "#ffffff",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
        }}
      >
        Welcome, <span style={{ color: '#FAE452' }}>{userName}</span>
      </h1>
      <p className="text-sm font-light tracking-wide mb-6" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
        Look at the camera and blink to spin
      </p>
    </>
  );
}
