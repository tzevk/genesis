"use client";

/**
 * WelcomeOverlay - Initial loading screen shown when canvas opens
 * Displays sector info and instructions
 */

import { motion } from "framer-motion";

// Brand colors
const COLORS = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  darkBlue: "#1a1a3e",
};

interface WelcomeOverlayProps {
  /** User's selected sector */
  sector: string;
  /** Sector accent color */
  sectorColor: string;
}

export function WelcomeOverlay({ sector, sectorColor }: WelcomeOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: COLORS.darkBlue }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${COLORS.blue}30 1px, transparent 1px), linear-gradient(90deg, ${COLORS.blue}30 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Glowing orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${COLORS.indigo}40`, top: '-10%', left: '-10%' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{ background: `${COLORS.blue}30`, bottom: '-10%', right: '-10%' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>

      <motion.div 
        className="relative text-center px-6" 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.1 }}
      >
        {/* 3D Rotating Icon Container */}
        <div 
          className="w-28 h-28 mx-auto mb-8"
          style={{ perspective: '1000px' }}
        >
          <motion.div 
            className="w-full h-full relative"
            style={{ 
              transformStyle: 'preserve-3d',
            }}
            animate={{ 
              rotateY: [0, 360],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {/* Front face */}
            <div 
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ 
                background: COLORS.indigo,
                border: `3px solid ${COLORS.yellow}`,
                boxShadow: `0 0 50px ${COLORS.yellow}40, 0 20px 40px rgba(0,0,0,0.5)`,
                backfaceVisibility: 'hidden',
                transform: 'translateZ(14px)',
              }}
            >
              {/* Oil Derrick / Drilling Rig Icon */}
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
                {/* Base platform */}
                <rect x="12" y="52" width="40" height="6" rx="2" fill={COLORS.yellow} />
                
                {/* Support legs */}
                <path d="M18 52L26 28" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" />
                <path d="M46 52L38 28" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" />
                
                {/* Cross beams */}
                <path d="M20 45L44 35" stroke={COLORS.yellow} strokeWidth="2" strokeLinecap="round" />
                <path d="M44 45L20 35" stroke={COLORS.yellow} strokeWidth="2" strokeLinecap="round" />
                
                {/* Derrick tower */}
                <path d="M26 28L32 8L38 28" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Tower cross beams */}
                <line x1="28" y1="22" x2="36" y2="22" stroke={COLORS.yellow} strokeWidth="2" />
                <line x1="27" y1="16" x2="37" y2="16" stroke={COLORS.yellow} strokeWidth="2" />
                
                {/* Crown block at top */}
                <rect x="29" y="6" width="6" height="4" rx="1" fill={COLORS.yellow} />
                
                {/* Drill line */}
                <line x1="32" y1="10" x2="32" y2="52" stroke={COLORS.blue} strokeWidth="2" strokeDasharray="4 2" />
                
                {/* Oil drops */}
                <circle cx="32" cy="58" r="2" fill={COLORS.blue} />
              </svg>
            </div>
            
            {/* Back face */}
            <div 
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ 
                background: COLORS.indigo,
                border: `3px solid ${COLORS.yellow}`,
                boxShadow: `0 0 50px ${COLORS.yellow}40, 0 20px 40px rgba(0,0,0,0.5)`,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(14px)',
              }}
            >
              {/* Oil Barrel Icon */}
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
                {/* Barrel body */}
                <ellipse cx="32" cy="12" rx="16" ry="6" fill={COLORS.yellow} />
                <path d="M16 12v40c0 3.3 7.2 6 16 6s16-2.7 16-6V12" stroke={COLORS.yellow} strokeWidth="3" />
                <ellipse cx="32" cy="52" rx="16" ry="6" fill="none" stroke={COLORS.yellow} strokeWidth="3" />
                
                {/* Barrel rings */}
                <ellipse cx="32" cy="24" rx="16" ry="4" fill="none" stroke={COLORS.yellow} strokeWidth="2" />
                <ellipse cx="32" cy="40" rx="16" ry="4" fill="none" stroke={COLORS.yellow} strokeWidth="2" />
                
                {/* Oil drop symbol on barrel */}
                <path d="M32 28c-4 5-6 8-6 11a6 6 0 1012 0c0-3-2-6-6-11z" fill={COLORS.blue} />
              </svg>
            </div>
          </motion.div>
        </div>
        
        {/* Title */}
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: COLORS.white }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Oil & Gas Plant Builder
        </motion.h1>
        
        {/* Sector badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ 
            background: `${COLORS.yellow}20`,
            border: `1px solid ${COLORS.yellow}50`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.yellow }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.yellow }}>
            {sector}
          </span>
        </motion.div>
        
        {/* Loading indicator */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Animated dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: COLORS.yellow }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <span className="text-sm" style={{ color: `${COLORS.white}70` }}>
            Loading challenge...
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
