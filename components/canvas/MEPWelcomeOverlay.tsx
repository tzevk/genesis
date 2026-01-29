"use client";

/**
 * MEPWelcomeOverlay - Water Tank Filling System themed loading screen
 * Features a water distribution system with source, pump, pipeline, tank, and sensor
 */

import { motion } from "framer-motion";

// MEP Infrastructure Color Palette - Safety/Technical feel
const COLORS = {
  emerald: "#10B981",
  teal: "#14B8A6",
  darkGreen: "#064E3B",
  deepGreen: "#022C22",
  amber: "#F59E0B",
  orange: "#F97316",
  red: "#EF4444",
  blue: "#3B82F6",
  coolWhite: "#F0FDF4",
  glass: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
};

interface MEPWelcomeOverlayProps {
  sector: string;
  sectorColor: string;
}

export function MEPWelcomeOverlay({ sector }: MEPWelcomeOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${COLORS.deepGreen} 0%, ${COLORS.darkGreen} 100%)` }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blueprint grid */}
        <svg className="absolute inset-0 w-full h-full opacity-15">
          <defs>
            <pattern id="mepGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke={COLORS.emerald} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mepGrid)" />
        </svg>
        
        {/* Glowing orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${COLORS.emerald}20 0%, transparent 70%)`,
            top: '-15%', 
            left: '-10%',
            filter: 'blur(60px)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${COLORS.amber}15 0%, transparent 70%)`,
            bottom: '-10%', 
            right: '-10%',
            filter: 'blur(50px)',
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2.5 }}
        />
      </div>

      <motion.div 
        className="relative text-center px-6" 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.1 }}
      >
        {/* Building Cross-Section Animation */}
        <div className="w-48 h-56 mx-auto mb-6">
          <svg viewBox="0 0 200 240" className="w-full h-full">
            {/* Building outline */}
            <motion.rect 
              x="30" y="20" width="140" height="200" rx="4"
              fill={COLORS.deepGreen}
              stroke={COLORS.emerald}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
            
            {/* Roof section - Storage */}
            <rect x="30" y="20" width="140" height="50" fill={`${COLORS.emerald}15`} />
            <text x="100" y="35" textAnchor="middle" fill={COLORS.emerald} fontSize="8" fontWeight="bold">STORAGE</text>
            
            {/* Floor 2 section - Distribution */}
            <rect x="30" y="70" width="140" height="70" fill={`${COLORS.amber}10`} />
            <line x1="30" y1="70" x2="170" y2="70" stroke={COLORS.emerald} strokeWidth="1" strokeDasharray="4,2" />
            <text x="100" y="85" textAnchor="middle" fill={COLORS.amber} fontSize="8" fontWeight="bold">DISTRIBUTION</text>
            
            {/* Floor 1 section - Source */}
            <rect x="30" y="140" width="140" height="80" fill={`${COLORS.blue}10`} />
            <line x1="30" y1="140" x2="170" y2="140" stroke={COLORS.emerald} strokeWidth="1" strokeDasharray="4,2" />
            <text x="100" y="155" textAnchor="middle" fill={COLORS.blue} fontSize="8" fontWeight="bold">SOURCE</text>
            
            {/* Water Tank on Storage Level */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <rect x="70" y="42" width="40" height="22" rx="2" fill={COLORS.blue} opacity="0.8" />
              <rect x="73" y="50" width="34" height="12" rx="1" fill={COLORS.blue} opacity="0.5">
                <animate attributeName="height" values="5;12;5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="y" values="57;50;57" dur="3s" repeatCount="indefinite" />
              </rect>
              <text x="90" y="48" textAnchor="middle" fill="white" fontSize="5">TANK</text>
            </motion.g>
            
            {/* Level Sensor */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <rect x="125" y="42" width="20" height="22" rx="2" fill={COLORS.amber} opacity="0.8" />
              <rect x="128" y="48" width="14" height="3" rx="1" fill={COLORS.emerald}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </rect>
              <rect x="128" y="53" width="14" height="3" rx="1" fill={COLORS.emerald} opacity="0.5" />
              <rect x="128" y="58" width="14" height="3" rx="1" fill={COLORS.red} opacity="0.3" />
            </motion.g>
            
            {/* Pipeline on Distribution Level */}
            <motion.g
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <rect x="85" y="95" width="8" height="40" rx="2" fill={COLORS.teal} opacity="0.8" />
              <rect x="45" y="110" width="50" height="8" rx="2" fill={COLORS.teal} opacity="0.8" />
              <circle cx="60" cy="114" r="3" fill={COLORS.blue}>
                <animate attributeName="cx" values="50;90;50" dur="2s" repeatCount="indefinite" />
              </circle>
            </motion.g>
            
            {/* Water Source Floor 1 */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <rect x="45" y="175" width="35" height="30" rx="2" fill={COLORS.blue} opacity="0.6" />
              <path d="M50 185 Q60 180 70 185 T80 185" fill="none" stroke={COLORS.blue} strokeWidth="1">
                <animate attributeName="d" values="M50 185 Q60 180 70 185;M50 185 Q60 190 70 185;M50 185 Q60 180 70 185" dur="1.5s" repeatCount="indefinite" />
              </path>
              <text x="62" y="198" textAnchor="middle" fill="white" fontSize="5">SOURCE</text>
            </motion.g>
            
            {/* Pump Floor 1 */}
            <motion.g
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <circle cx="125" cy="185" r="15" fill={COLORS.emerald} opacity="0.8" />
              <circle cx="125" cy="185" r="8" fill={COLORS.deepGreen} />
              <motion.line 
                x1="117" y1="185" x2="133" y2="185" 
                stroke="white" 
                strokeWidth="2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "125px 185px" }}
              />
            </motion.g>
            
            {/* Connecting lines (pipes) */}
            <motion.path
              d="M89 140 L89 70"
              stroke={COLORS.teal}
              strokeWidth="2"
              strokeDasharray="4,4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            />
            <motion.path
              d="M89 64 L89 42"
              stroke={COLORS.blue}
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
            />
          </svg>
        </div>
        
        {/* Title */}
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: COLORS.coolWhite }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Water Tank Filling System
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base mb-4"
          style={{ color: `${COLORS.coolWhite}70` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Build a complete water distribution system
        </motion.p>
        
        {/* Sector badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ 
            background: COLORS.glass,
            border: `1px solid ${COLORS.emerald}40`,
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="w-2 h-2 rounded-full"
            style={{ background: COLORS.emerald }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-semibold" style={{ color: COLORS.emerald }}>
            {sector}
          </span>
        </motion.div>
        
        {/* System indicators */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${COLORS.blue}20` }}>
            <span className="text-xs" style={{ color: COLORS.blue }}>💧 Source</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${COLORS.emerald}20` }}>
            <span className="text-xs" style={{ color: COLORS.emerald }}>⚙️ Pump</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${COLORS.amber}20` }}>
            <span className="text-xs" style={{ color: COLORS.amber }}>📊 Sensor</span>
          </div>
        </motion.div>
        
        {/* Loading indicator */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative w-6 h-6">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${COLORS.emerald}40` }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                border: `2px solid transparent`,
                borderTopColor: COLORS.emerald,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <span className="text-sm" style={{ color: `${COLORS.coolWhite}70` }}>
            Loading water system...
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
