"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuiz } from "@/lib/quiz-context";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#1a1d2e",
};

// Animated checkmark
function AnimatedCheckmark() {
  return (
    <motion.div
      className="relative w-20 h-20 xs:w-24 xs:h-24 mx-auto mb-6 xs:mb-8"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.2 
      }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ 
          background: `${BRAND.yellow}10`,
          border: `2px solid ${BRAND.yellow}30`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      
      {/* Inner circle */}
      <motion.div
        className="absolute inset-3 xs:inset-4 rounded-full flex items-center justify-center"
        style={{ background: BRAND.yellow }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <motion.svg 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={BRAND.dark}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <motion.path 
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

// Minimal background
function MinimalBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(160deg, ${BRAND.dark} 0%, ${BRAND.indigo}10 50%, ${BRAND.dark} 100%)`,
        }}
      />
      {/* Subtle radial accent */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${BRAND.yellow}, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default function ResetPage() {
  const router = useRouter();
  const { clearAllState } = useQuiz();

  const handleRestart = async () => {
    // Clear all quiz state
    clearAllState();
    
    // Also clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
    
    // Redirect to welcome/home page
    router.push("/");
  };

  const features = [
    "Explored Industrial Engineering Sectors",
    "Completed Industry Literacy Assessment",
    "Received Personalized Insights",
  ];

  return (
    <div className="min-h-screen min-h-[568px] flex flex-col items-center justify-center relative overflow-hidden">
      <MinimalBackground />

      <div className="relative z-10 flex flex-col items-center px-4 xs:px-6 max-w-lg w-full text-center">
        {/* Checkmark Animation */}
        <AnimatedCheckmark />

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 
            className="text-2xl xs:text-3xl sm:text-4xl font-semibold mb-3 xs:mb-4"
            style={{ color: BRAND.white }}
          >
            Thank you for exploring
            <br />
            <span 
              className="inline-block mt-1"
              style={{ color: BRAND.yellow }}
            >
              GENESIS
            </span>
          </h1>
          
          <p 
            className="text-sm xs:text-base mb-6 xs:mb-8 leading-relaxed"
            style={{ color: `${BRAND.white}60` }}
          >
            Your journey through our engineering simulation 
            platform is complete.
          </p>
        </motion.div>

        {/* Journey Summary */}
        <motion.div
          className="w-full p-4 xs:p-6 rounded-xl xs:rounded-2xl mb-6 xs:mb-8"
          style={{
            background: `${BRAND.white}03`,
            border: `1px solid ${BRAND.white}08`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p 
            className="text-xs xs:text-sm uppercase tracking-wider mb-4"
            style={{ color: `${BRAND.white}50` }}
          >
            Your Journey
          </p>
          <div className="space-y-2.5 xs:space-y-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div 
                  className="w-5 h-5 xs:w-6 xs:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${BRAND.yellow}15` }}
                >
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={BRAND.yellow}
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <span 
                  className="text-xs xs:text-sm"
                  style={{ color: `${BRAND.white}80` }}
                >
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Website Links */}
        <motion.div
          className="w-full grid grid-cols-2 gap-3 mb-4 xs:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <a
            href="https://www.accent.net.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 xs:py-4 rounded-xl font-medium text-xs xs:text-sm text-center transition-all"
            style={{
              background: `${BRAND.white}05`,
              border: `1px solid ${BRAND.white}15`,
              color: BRAND.white,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${BRAND.yellow}40`;
              e.currentTarget.style.background = `${BRAND.white}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${BRAND.white}15`;
              e.currentTarget.style.background = `${BRAND.white}05`;
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Accent Techno
            </span>
          </a>
          <a
            href="https://suvidya.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 xs:py-4 rounded-xl font-medium text-xs xs:text-sm text-center transition-all"
            style={{
              background: `${BRAND.white}05`,
              border: `1px solid ${BRAND.white}15`,
              color: BRAND.white,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${BRAND.yellow}40`;
              e.currentTarget.style.background = `${BRAND.white}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${BRAND.white}15`;
              e.currentTarget.style.background = `${BRAND.white}05`;
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Suvidya Institute
            </span>
          </a>
        </motion.div>

        {/* Restart Button */}
        <motion.button
          className="w-full py-3 xs:py-4 rounded-xl font-medium text-sm xs:text-base mb-4 xs:mb-6"
          style={{
            background: BRAND.yellow,
            color: BRAND.dark,
          }}
          onClick={handleRestart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Start New Session
          </span>
        </motion.button>

        {/* Footer */}
        <motion.div
          className="mt-4 xs:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p 
            className="text-[10px] xs:text-xs mb-1"
            style={{ color: `${BRAND.white}40` }}
          >
            <span style={{ color: BRAND.yellow }}>Accent Techno Solutions</span>
            {" × "}
            <span>Suvidya Institute of Technology</span>
          </p>
          <p 
            className="text-[9px] xs:text-[10px] uppercase tracking-wider"
            style={{ color: `${BRAND.white}25` }}
          >
            GENESIS — Engineering Simulation Platform
          </p>
        </motion.div>
      </div>
    </div>
  );
}
