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

type PagePhase = "intro" | "invitation" | "wheel";

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

  // Transition to invitation phase
  const handleContinue = () => {
    setPhase("invitation");
  };

  // Transition to wheel phase
  const handleShowWheel = () => {
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
    <AnimatePresence mode="wait">
      {/* INTRO PHASE - Statement */}
      {phase === "intro" && (
        <motion.div
          key="intro"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer"
          style={{ backgroundColor: "#0a4d8c" }}
          onClick={showContinue ? handleContinue : undefined}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Blueprint paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Blueprint grid using SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fine grid lines (3px spacing) */}
            {Array.from({ length: 700 }).map((_, i) => (
              <line
                key={`fh-${i}`}
                x1="0"
                y1={i * 3}
                x2="100%"
                y2={i * 3}
                stroke="#FAE452"
                strokeWidth="0.2"
                strokeOpacity="0.15"
              />
            ))}
            {Array.from({ length: 1000 }).map((_, i) => (
              <line
                key={`fv-${i}`}
                x1={i * 3}
                y1="0"
                x2={i * 3}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.2"
                strokeOpacity="0.15"
              />
            ))}
            
            {/* Medium grid lines (15px spacing) */}
            {Array.from({ length: 140 }).map((_, i) => (
              <line
                key={`mh-${i}`}
                x1="0"
                y1={i * 15}
                x2="100%"
                y2={i * 15}
                stroke="#FAE452"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}
            {Array.from({ length: 200 }).map((_, i) => (
              <line
                key={`mv-${i}`}
                x1={i * 15}
                y1="0"
                x2={i * 15}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}
            
            {/* Main grid lines (30px spacing) */}
            {Array.from({ length: 70 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 30}
                x2="100%"
                y2={i * 30}
                stroke="#FAE452"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            ))}
            {Array.from({ length: 100 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 30}
                y1="0"
                x2={i * 30}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            ))}
          </svg>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(20, 20, 60, 0.6) 100%)",
            }}
          />

          {/* Statement text */}
          <motion.div
            className="relative z-10 text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className="text-2xl md:text-4xl font-light whitespace-nowrap"
              style={{ 
                color: "#ffffff",
                fontFamily: "system-ui, -apple-system, sans-serif",
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
                  {" "}<span style={{ color: "#FAE452", fontWeight: 500 }}>choice</span>.
                </motion.span>
              )}
            </h1>

            {/* Sectors list */}
            {showSectors && (
              <motion.p
                className="mt-6 text-lg md:text-xl font-light tracking-wide"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <span style={{ color: "#FAE452" }}>Process</span>
                <span style={{ color: "rgba(255, 255, 255, 0.4)" }}> · </span>
                <span style={{ color: "#FAE452" }}>Electrical</span>
                <span style={{ color: "rgba(255, 255, 255, 0.4)" }}> · </span>
                <span style={{ color: "#FAE452" }}>HVAC</span>
                <span style={{ color: "rgba(255, 255, 255, 0.4)" }}> · </span>
                <span style={{ color: "#FAE452" }}>Oil & Gas</span>
                <span style={{ color: "rgba(255, 255, 255, 0.4)" }}> · </span>
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
              <motion.p
                className="mt-12 text-sm tracking-wider"
                style={{ color: "rgba(250, 228, 82, 0.6)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                TAP TO CONTINUE
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* INVITATION PHASE */}
      {phase === "invitation" && (
        <motion.div
          key="invitation"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer"
          style={{ backgroundColor: "#0a4d8c" }}
          onClick={handleShowWheel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Blueprint paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Blueprint grid using SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fine grid lines (3px spacing) */}
            {Array.from({ length: 700 }).map((_, i) => (
              <line
                key={`inv-fh-${i}`}
                x1="0"
                y1={i * 3}
                x2="100%"
                y2={i * 3}
                stroke="#FAE452"
                strokeWidth="0.2"
                strokeOpacity="0.15"
              />
            ))}
            {Array.from({ length: 1000 }).map((_, i) => (
              <line
                key={`inv-fv-${i}`}
                x1={i * 3}
                y1="0"
                x2={i * 3}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.2"
                strokeOpacity="0.15"
              />
            ))}
            
            {/* Medium grid lines (15px spacing) */}
            {Array.from({ length: 140 }).map((_, i) => (
              <line
                key={`inv-mh-${i}`}
                x1="0"
                y1={i * 15}
                x2="100%"
                y2={i * 15}
                stroke="#FAE452"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}
            {Array.from({ length: 200 }).map((_, i) => (
              <line
                key={`inv-mv-${i}`}
                x1={i * 15}
                y1="0"
                x2={i * 15}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}
            
            {/* Main grid lines (30px spacing) */}
            {Array.from({ length: 70 }).map((_, i) => (
              <line
                key={`inv-h-${i}`}
                x1="0"
                y1={i * 30}
                x2="100%"
                y2={i * 30}
                stroke="#FAE452"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            ))}
            {Array.from({ length: 100 }).map((_, i) => (
              <line
                key={`inv-v-${i}`}
                x1={i * 30}
                y1="0"
                x2={i * 30}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            ))}
          </svg>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 40, 80, 0.6) 100%)",
            }}
          />

          {/* Invitation content */}
          <motion.div
            className="relative z-10 text-center px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.p
              className="text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: "rgba(250, 228, 82, 0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
            </motion.p>
            
            <motion.h1
              className="text-2xl md:text-4xl font-light"
              style={{ 
                color: "#ffffff",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Discover where your journey begins.
            </motion.h1>

            {/* Tap to continue */}
            <motion.p
              className="mt-12 text-sm tracking-wider"
              style={{ color: "rgba(250, 228, 82, 0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
            >
              TAP TO CONTINUE
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {/* WHEEL PHASE */}
      {phase === "wheel" && (
        <motion.div
          key="wheel"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
          style={{ backgroundColor: "#0a4d8c" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Blueprint grid background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fine grid lines (3px spacing) */}
            {Array.from({ length: 700 }).map((_, i) => (
              <line
                key={`wh-fh-${i}`}
                x1="0"
                y1={i * 3}
                x2="100%"
                y2={i * 3}
                stroke="#FAE452"
                strokeWidth="0.2"
                strokeOpacity="0.15"
              />
            ))}
            {Array.from({ length: 1000 }).map((_, i) => (
              <line
                key={`wh-fv-${i}`}
                x1={i * 3}
                y1="0"
                x2={i * 3}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.2"
                strokeOpacity="0.15"
              />
            ))}
            
            {/* Medium grid lines (15px spacing) */}
            {Array.from({ length: 140 }).map((_, i) => (
              <line
                key={`wh-mh-${i}`}
                x1="0"
                y1={i * 15}
                x2="100%"
                y2={i * 15}
                stroke="#FAE452"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}
            {Array.from({ length: 200 }).map((_, i) => (
              <line
                key={`wh-mv-${i}`}
                x1={i * 15}
                y1="0"
                x2={i * 15}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}
            
            {/* Main grid lines (30px spacing) */}
            {Array.from({ length: 70 }).map((_, i) => (
              <line
                key={`wh-h-${i}`}
                x1="0"
                y1={i * 30}
                x2="100%"
                y2={i * 30}
                stroke="#FAE452"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            ))}
            {Array.from({ length: 100 }).map((_, i) => (
              <line
                key={`wh-v-${i}`}
                x1={i * 30}
                y1="0"
                x2={i * 30}
                y2="100%"
                stroke="#FAE452"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            ))}
          </svg>

          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(5, 40, 80, 0.5) 100%)",
            }}
          />

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
                  className="text-3xl md:text-4xl font-light tracking-wide mb-2"
                  style={{ color: "#FAE452" }}
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
                  className="px-10 py-3 rounded-full text-sm tracking-wider font-medium transition-all duration-300"
                  style={{
                    background: "rgba(250, 228, 82, 0.15)",
                    border: "1px solid rgba(250, 228, 82, 0.6)",
                    color: "#FAE452",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  whileHover={{ background: "rgba(250, 228, 82, 0.25)" }}
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
  );
}

interface WelcomeHeaderProps {
  userName: string;
}

function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-light mb-2" style={{ color: "#ffffff" }}>
        Welcome, <span style={{ color: '#FAE452' }}>{userName}</span>
      </h1>
      <p className="text-sm font-light tracking-wide mb-6" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
        Look at the camera and blink to spin
      </p>
    </>
  );
}
