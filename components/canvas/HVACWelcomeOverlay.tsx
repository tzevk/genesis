"use client";

/**
 * HVACWelcomeOverlay - Smart building themed loading screen for HVAC sector
 * Features glassy panels, neon accents, and cool-tone aesthetics
 */

import { motion } from "framer-motion";

// HVAC Smart Building Color Palette
const COLORS = {
  cyan: "#00D4FF",
  teal: "#0EA5A5",
  darkBlue: "#0A1628",
  deepBlue: "#0F2847",
  neonGreen: "#00FF94",
  neonBlue: "#00B4FF",
  coolWhite: "#E8F4F8",
  glass: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
};

interface HVACWelcomeOverlayProps {
  sector: string;
  sectorColor: string;
}

export function HVACWelcomeOverlay({ sector }: HVACWelcomeOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.deepBlue} 100%)` }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated background - Grid pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="hvacGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={COLORS.cyan} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hvacGrid)" />
        </svg>
        
        {/* Glowing orbs with cyan/teal tones */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${COLORS.cyan}20 0%, transparent 70%)`,
            top: '-15%', 
            left: '-10%',
            filter: 'blur(60px)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${COLORS.teal}25 0%, transparent 70%)`,
            bottom: '-10%', 
            right: '-10%',
            filter: 'blur(50px)',
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2.5 }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${COLORS.neonGreen}15 0%, transparent 70%)`,
            top: '40%', 
            right: '20%',
            filter: 'blur(40px)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              background: i % 2 === 0 ? COLORS.cyan : COLORS.neonGreen,
              left: `${(i * 7.3 + 5) % 100}%`,
              top: `${(i * 5.7 + 10) % 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + (i % 4) * 0.5,
              repeat: Infinity,
              delay: (i % 6) * 0.2,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="relative text-center px-6" 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.1 }}
      >
        {/* Smart Building Icon Container - Glassy */}
        <div className="w-32 h-32 mx-auto mb-8" style={{ perspective: '1000px' }}>
          <motion.div 
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            {/* Front face - Thermostat */}
            <div 
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ 
                background: COLORS.glass,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${COLORS.cyan}60`,
                boxShadow: `0 0 60px ${COLORS.cyan}30, 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
                backfaceVisibility: 'hidden',
                transform: 'translateZ(16px)',
              }}
            >
              <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
                {/* Outer ring */}
                <circle cx="40" cy="40" r="32" fill="none" stroke={COLORS.cyan} strokeWidth="2" opacity="0.6" />
                <circle cx="40" cy="40" r="28" fill={COLORS.deepBlue} stroke={COLORS.glassBorder} strokeWidth="1" />
                {/* Temperature arc */}
                <path 
                  d="M 20 50 A 24 24 0 0 1 60 50" 
                  fill="none" 
                  stroke={COLORS.neonGreen} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                {/* Temperature display */}
                <text x="40" y="38" textAnchor="middle" fill={COLORS.coolWhite} fontSize="16" fontWeight="bold">68°</text>
                <text x="40" y="52" textAnchor="middle" fill={COLORS.cyan} fontSize="8" fontWeight="500">COOLING</text>
                {/* WiFi waves */}
                <path d="M35 60 Q40 56 45 60" stroke={COLORS.neonGreen} strokeWidth="1.5" fill="none" />
                <path d="M32 63 Q40 55 48 63" stroke={COLORS.neonGreen} strokeWidth="1.5" fill="none" opacity="0.5" />
              </svg>
            </div>
            
            {/* Back face - Building with airflow */}
            <div 
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ 
                background: COLORS.glass,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${COLORS.cyan}60`,
                boxShadow: `0 0 60px ${COLORS.cyan}30, 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(16px)',
              }}
            >
              <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
                {/* Smart building outline */}
                <rect x="18" y="20" width="44" height="48" rx="4" fill={COLORS.deepBlue} stroke={COLORS.cyan} strokeWidth="2" />
                {/* Windows - glowing */}
                <rect x="24" y="26" width="10" height="8" rx="1" fill={COLORS.neonBlue} opacity="0.6" />
                <rect x="46" y="26" width="10" height="8" rx="1" fill={COLORS.neonBlue} opacity="0.6" />
                <rect x="24" y="40" width="10" height="8" rx="1" fill={COLORS.cyan} opacity="0.4" />
                <rect x="46" y="40" width="10" height="8" rx="1" fill={COLORS.neonGreen} opacity="0.5" />
                <rect x="24" y="54" width="10" height="8" rx="1" fill={COLORS.neonGreen} opacity="0.4" />
                <rect x="46" y="54" width="10" height="8" rx="1" fill={COLORS.cyan} opacity="0.5" />
                {/* Central display */}
                <rect x="35" y="38" width="10" height="14" rx="2" fill={COLORS.glass} stroke={COLORS.glassBorder} />
                <text x="40" y="48" textAnchor="middle" fill={COLORS.neonGreen} fontSize="6">OK</text>
                {/* Airflow indicators */}
                <path d="M10 35 Q14 32 18 35" stroke={COLORS.neonBlue} strokeWidth="2" fill="none" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                </path>
                <path d="M62 35 Q66 32 70 35" stroke={COLORS.neonBlue} strokeWidth="2" fill="none" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                </path>
              </svg>
            </div>
          </motion.div>
        </div>
        
        {/* Title - Smart Building themed */}
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: COLORS.coolWhite }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Smart HVAC Builder
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base mb-4"
          style={{ color: `${COLORS.coolWhite}70` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Build an intelligent cooling system
        </motion.p>
        
        {/* Sector badge - Glassy style */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ 
            background: COLORS.glass,
            border: `1px solid ${COLORS.cyan}40`,
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="w-2 h-2 rounded-full"
            style={{ background: COLORS.neonGreen }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-semibold" style={{ color: COLORS.cyan }}>
            {sector}
          </span>
        </motion.div>
        
        {/* Temperature dropping animation */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ 
            background: `${COLORS.neonBlue}15`,
            border: `1px solid ${COLORS.neonBlue}30`,
          }}>
            <motion.span 
              className="text-lg"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ❄️
            </motion.span>
            <span className="text-xs font-medium" style={{ color: COLORS.neonBlue }}>
              82°F → 68°F
            </span>
          </div>
        </motion.div>
        
        {/* Loading indicator - Neon style */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Animated rings */}
          <div className="relative w-6 h-6">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${COLORS.cyan}40` }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                border: `2px solid transparent`,
                borderTopColor: COLORS.cyan,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <span className="text-sm" style={{ color: `${COLORS.coolWhite}70` }}>
            Initializing system...
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
