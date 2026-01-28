"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ThankYouOverlayProps {
  isVisible: boolean;
  userName?: string;
  score?: number;
  grade?: string;
  sector?: string;
  onComplete: () => void;
}

const COLORS = {
  indigo: "#2E3093",
  yellow: "#FAE452",
  white: "#FFFFFF",
  gold: "#FFD700",
  bronze: "#CD7F32",
  silver: "#C0C0C0",
};

// Confetti particle component - uses index for deterministic values
function Confetti({ index, delay, color }: { index: number; delay: number; color: string }) {
  // Use index to create pseudo-random but deterministic values
  const randomX = (index * 17) % 100;
  const randomRotation = (index * 47) % 360;
  const randomDuration = 3 + (index % 5) * 0.5;
  const size = 8 + (index % 4) * 3;
  const xOffset1 = ((index * 31) % 100) - 50;
  const xOffset2 = ((index * 53) % 100) - 50;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${randomX}%`,
        width: size,
        height: size * 0.6,
        background: color,
        borderRadius: 2,
      }}
      initial={{ y: -20, opacity: 1, rotate: randomRotation }}
      animate={{
        y: "100vh",
        opacity: [1, 1, 0],
        rotate: randomRotation + 720,
        x: [0, xOffset1, xOffset2],
      }}
      transition={{
        duration: randomDuration,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
}

// Sparkle component
function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path
          d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z"
          fill={COLORS.yellow}
        />
      </svg>
    </motion.div>
  );
}

// Floating orb - uses index for deterministic values
function FloatingOrb({ index, delay, size, color }: { index: number; delay: number; size: number; color: string }) {
  const startX = (index * 23) % 100;
  const duration = 8 + (index % 5);
  
  return (
    <motion.div
      className="absolute rounded-full blur-xl"
      style={{
        left: `${startX}%`,
        bottom: "-10%",
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -1200],
        x: [0, Math.sin(delay) * 100],
        opacity: [0.3, 0.6, 0],
      }}
      transition={{
        duration: duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export default function ThankYouOverlay({
  isVisible,
  userName = "Engineer",
  score = 0,
  grade = "A",
  sector = "",
  onComplete,
}: ThankYouOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Get grade color
  const getGradeColor = () => {
    if (grade === "A+" || grade === "A") return COLORS.gold;
    if (grade === "B+" || grade === "B") return COLORS.silver;
    return COLORS.bronze;
  };

  // Generate confetti colors based on sector or default
  const confettiColors = [
    COLORS.yellow,
    COLORS.gold,
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
  ];

  useEffect(() => {
    if (isVisible) {
      // Delay showing content for dramatic effect
      const showTimer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(showTimer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!showContent) return;

    // Start countdown after content shows
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setTimeout(onComplete, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [showContent, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${COLORS.indigo} 0%, #1a1a5e 50%, #0f0f3d 100%)`,
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `radial-gradient(circle at 30% 30%, ${COLORS.indigo}40 0%, transparent 50%)`,
                `radial-gradient(circle at 70% 70%, ${COLORS.indigo}40 0%, transparent 50%)`,
                `radial-gradient(circle at 30% 70%, ${COLORS.indigo}40 0%, transparent 50%)`,
                `radial-gradient(circle at 70% 30%, ${COLORS.indigo}40 0%, transparent 50%)`,
                `radial-gradient(circle at 30% 30%, ${COLORS.indigo}40 0%, transparent 50%)`,
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating orbs */}
          {[...Array(8)].map((_, i) => (
            <FloatingOrb
              key={`orb-${i}`}
              index={i}
              delay={i * 1.5}
              size={100 + i * 30}
              color={i % 2 === 0 ? COLORS.yellow : COLORS.indigo}
            />
          ))}

          {/* Confetti */}
          {showContent &&
            [...Array(50)].map((_, i) => (
              <Confetti
                key={`confetti-${i}`}
                index={i}
                delay={i * 0.05}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}

          {/* Sparkles */}
          {[...Array(12)].map((_, i) => (
            <Sparkle
              key={`sparkle-${i}`}
              x={10 + (i % 4) * 25}
              y={15 + Math.floor(i / 4) * 30}
              delay={i * 0.3}
            />
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: showContent ? 1 : 0.5, opacity: showContent ? 1 : 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="relative z-10 text-center px-8 max-w-lg"
          >
            {/* Trophy/Medal icon */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6"
            >
              <motion.div
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${getGradeColor()}30, ${getGradeColor()}10)`,
                  border: `3px solid ${getGradeColor()}`,
                  boxShadow: `0 0 40px ${getGradeColor()}50, inset 0 0 30px ${getGradeColor()}20`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 40px ${getGradeColor()}50, inset 0 0 30px ${getGradeColor()}20`,
                    `0 0 60px ${getGradeColor()}70, inset 0 0 40px ${getGradeColor()}30`,
                    `0 0 40px ${getGradeColor()}50, inset 0 0 30px ${getGradeColor()}20`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={getGradeColor()}
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 15l-2 5h4l-2-5zm0 0a6 6 0 006-6V4H6v5a6 6 0 006 6z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M6 4H4v3a3 3 0 003 3M18 4h2v3a3 3 0 01-3 3" strokeLinecap="round" />
                </svg>
                
                {/* Grade badge */}
                <motion.div
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    background: getGradeColor(),
                    color: COLORS.indigo,
                    boxShadow: `0 4px 20px ${getGradeColor()}80`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  {grade}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Thank you text */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h1
                className="text-5xl font-bold mb-3"
                style={{
                  color: COLORS.white,
                  textShadow: `0 0 30px ${COLORS.yellow}50`,
                }}
              >
                Thank You!
              </h1>
              
              <motion.p
                className="text-xl mb-2"
                style={{ color: COLORS.yellow }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {userName}
              </motion.p>

              <motion.p
                className="text-base mb-6"
                style={{ color: `${COLORS.white}80` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                You&apos;ve completed the {sector || "simulation"} challenge!
              </motion.p>
            </motion.div>

            {/* Score display */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, type: "spring" }}
              className="mb-8 p-6 rounded-2xl"
              style={{
                background: `${COLORS.white}10`,
                backdropFilter: "blur(20px)",
                border: `1px solid ${COLORS.white}20`,
              }}
            >
              <p className="text-sm mb-2" style={{ color: `${COLORS.white}60` }}>
                Final Score
              </p>
              <motion.p
                className="text-6xl font-bold"
                style={{ color: COLORS.yellow }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                {score.toFixed(1)}
              </motion.p>
              <p className="text-sm mt-1" style={{ color: `${COLORS.white}50` }}>
                out of 10
              </p>
            </motion.div>

            {/* Encouraging message based on grade */}
            <motion.p
              className="text-lg mb-8"
              style={{ color: `${COLORS.white}90` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {grade === "A+" || grade === "A"
                ? "Outstanding performance! You're a true expert! 🌟"
                : grade === "B+" || grade === "B"
                ? "Great job! You've shown solid skills! 💪"
                : grade === "C"
                ? "Good effort! Keep learning and improving! 📚"
                : "Nice try! Practice makes perfect! 🎯"}
            </motion.p>

            {/* Countdown to redirect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-sm" style={{ color: `${COLORS.white}50` }}>
                Redirecting to leaderboard in
              </p>
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: `${COLORS.yellow}20`,
                  border: `2px solid ${COLORS.yellow}`,
                  color: COLORS.yellow,
                }}
                key={countdown}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                {countdown}
              </motion.div>
              
              <motion.button
                onClick={onComplete}
                className="mt-4 px-6 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: `${COLORS.white}10`,
                  color: COLORS.white,
                  border: `1px solid ${COLORS.white}30`,
                }}
                whileHover={{ scale: 1.05, background: `${COLORS.white}20` }}
                whileTap={{ scale: 0.95 }}
              >
                Skip to Leaderboard →
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Bottom decorative wave */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <motion.path
                d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
                fill={`${COLORS.yellow}15`}
                animate={{
                  d: [
                    "M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z",
                    "M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,120 L0,120 Z",
                    "M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z",
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
