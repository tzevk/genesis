"use client";

/**
 * Quiz Complete Page - Thank you screen shown after quiz ends
 * Shows score out of 10 and scholarship info before insights
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz } from "@/lib/quiz-context";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#1a1d2e",
  green: "#22C55E",
  pink: "#EC4899",
  orange: "#F97316",
};

// Scholarship discount based on score (out of 10)
function getScholarshipDiscount(scoreOutOf10: number): { percentage: number; eligible: boolean } {
  if (scoreOutOf10 >= 9) return { percentage: 5, eligible: true };
  if (scoreOutOf10 >= 8) return { percentage: 3, eligible: true };
  if (scoreOutOf10 >= 7) return { percentage: 2, eligible: true };
  return { percentage: 0, eligible: false };
}

// Confetti colors
const CONFETTI_COLORS = [
  BRAND.yellow, 
  BRAND.blue, 
  BRAND.pink, 
  BRAND.green, 
  BRAND.orange, 
  BRAND.white,
  "#A855F7", // purple
  "#06B6D4", // cyan
];

// Generate confetti particles
const generateConfetti = (count: number) => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));

// Floating sparkles component with SVG
function FloatingSparkles() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={BRAND.yellow}>
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

export default function QuizCompletePage() {
  const router = useRouter();
  const { answers, insights } = useQuiz();
  const [showContent, setShowContent] = useState(false);
  // Initialize confetti immediately
  const [confetti] = useState(() => generateConfetti(50));

  useEffect(() => {
    // If no answers, redirect to quiz
    if (answers.length === 0) {
      router.replace("/industry-quiz");
      return;
    }
    
    // Delay content appearance for dramatic effect
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, [answers, router]);

  if (answers.length === 0 || !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.dark }}>
        <motion.div
          className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;
  // Convert to score out of 10 (5 questions = multiply by 2)
  const scoreOutOf10 = Math.round((correctAnswers / totalQuestions) * 10);
  const scholarship = getScholarshipDiscount(scoreOutOf10);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.indigo}40 50%, ${BRAND.dark} 100%)`,
      }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${BRAND.yellow}15 0%, transparent 50%)`,
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Confetti rain */}
      <AnimatePresence>
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            className={c.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}
            style={{ 
              position: 'absolute',
              background: c.color,
              width: c.size,
              height: c.size,
              left: `${c.x}%`,
              top: -20,
              rotate: c.rotation,
            }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [c.rotation, c.rotation + 720],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Floating sparkles */}
      {scholarship.eligible && <FloatingSparkles />}

      <AnimatePresence>
        {showContent && (
          <motion.div
            className="text-center max-w-md w-full px-4 relative z-10"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            {/* Trophy/Success Icon with glow */}
            <motion.div
              className="relative inline-block mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="absolute inset-0 blur-2xl"
                style={{ background: BRAND.yellow, opacity: 0.4 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative w-20 h-20 xs:w-24 xs:h-24 flex items-center justify-center">
                {scholarship.eligible ? (
                  <svg viewBox="0 0 24 24" fill={BRAND.yellow} className="w-16 h-16 xs:w-20 xs:h-20">
                    <path d="M5 3h14c.55 0 1 .45 1 1v2c0 2.55-1.92 4.63-4.39 4.94.63 1.01 1.04 2.17 1.14 3.42l.23 2.28c.05.5.04 1.01-.02 1.51l-.22 1.85h-9.5l-.22-1.85c-.06-.5-.07-1.01-.02-1.51l.23-2.28c.1-1.25.51-2.41 1.14-3.42C6.92 10.63 5 8.55 5 6V4c0-.55.45-1 1-1h-1zm2 2v1c0 1.1.9 2 2 2h.39c.44-1.23 1.21-2.3 2.21-3H7zm10 0h-3.6c1 .7 1.77 1.77 2.21 3H16c1.1 0 2-.9 2-2V5h-1zM8 22h8v-1H8v1z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill={BRAND.yellow} className="w-16 h-16 xs:w-20 xs:h-20">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </div>
            </motion.div>

            {/* Thank You Message */}
            <motion.h1
              className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: BRAND.white }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {scholarship.eligible ? "Outstanding!" : "Quiz Complete!"}
            </motion.h1>

            <motion.p
              className="text-sm xs:text-base mb-6"
              style={{ color: `${BRAND.white}80` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Thank you for taking the Industry Literacy Assessment
            </motion.p>

            {/* Score Display */}
            <motion.div
              className="relative p-6 xs:p-8 rounded-3xl mb-6"
              style={{
                background: `linear-gradient(135deg, ${BRAND.white}10, ${BRAND.white}05)`,
                border: `1px solid ${BRAND.white}20`,
                boxShadow: `0 20px 40px ${BRAND.dark}80`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs xs:text-sm uppercase tracking-widest mb-3" style={{ color: `${BRAND.white}60` }}>
                Your Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <motion.span 
                  className="text-6xl xs:text-7xl font-bold"
                  style={{ color: BRAND.yellow }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                >
                  {scoreOutOf10}
                </motion.span>
                <span 
                  className="text-2xl xs:text-3xl font-light"
                  style={{ color: `${BRAND.white}50` }}
                >
                  /10
                </span>
              </div>
              <motion.p 
                className="text-xs xs:text-sm mt-3" 
                style={{ color: `${BRAND.white}50` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {correctAnswers} out of {totalQuestions} questions correct
              </motion.p>
            </motion.div>

            {/* Scholarship Award - Enhanced */}
            {scholarship.eligible && (
              <motion.div
                className="p-5 xs:p-6 rounded-2xl mb-6 text-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.yellow}25, ${BRAND.yellow}10)`,
                  border: `2px solid ${BRAND.yellow}60`,
                  boxShadow: `0 0 30px ${BRAND.yellow}30`,
                }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.1, type: "spring" }}
              >
                {/* Sparkle effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, transparent 30%, ${BRAND.white}20 50%, transparent 70%)`,
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                
                <motion.div
                  className="mb-3 flex justify-center"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1, delay: 1.3 }}
                >
                  <svg viewBox="0 0 24 24" fill={BRAND.yellow} className="w-12 h-12 xs:w-14 xs:h-14">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                  </svg>
                </motion.div>
                <h3 
                  className="text-lg xs:text-xl font-bold mb-2"
                  style={{ color: BRAND.yellow }}
                >
                  Congratulations!
                </h3>
                <p 
                  className="text-3xl xs:text-4xl font-bold mb-2"
                  style={{ color: BRAND.white }}
                >
                  {scholarship.percentage}% Scholarship
                </p>
                <p 
                  className="text-sm xs:text-base"
                  style={{ color: `${BRAND.white}80` }}
                >
                  at <span style={{ color: BRAND.yellow, fontWeight: 700 }}>Suvidya Institute of Technology</span>
                </p>
                <p 
                  className="text-[10px] xs:text-xs mt-2"
                  style={{ color: `${BRAND.white}50` }}
                >
                  Present this screen to claim your discount
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <motion.button
                className="w-full py-3.5 xs:py-4 rounded-xl font-semibold text-sm xs:text-base transition-all"
                style={{
                  background: BRAND.yellow,
                  color: BRAND.dark,
                }}
                onClick={() => router.push("/insights")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Detailed Insights
              </motion.button>

              <motion.button
                className="w-full py-3 rounded-xl font-medium text-sm transition-all"
                style={{
                  background: `${BRAND.white}10`,
                  color: BRAND.white,
                  border: `1px solid ${BRAND.white}25`,
                }}
                onClick={() => router.push("/")}
                whileHover={{ background: `${BRAND.white}15` }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Home
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
