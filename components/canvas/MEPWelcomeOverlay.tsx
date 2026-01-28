"use client";

/**
 * MEPWelcomeOverlay - Building infrastructure themed loading screen
 * Features a building cross-section with MEP systems
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
            
            {/* Roof section */}
            <rect x="30" y="20" width="140" height="50" fill={`${COLORS.emerald}15`} />
            <text x="100" y="35" textAnchor="middle" fill={COLORS.emerald} fontSize="8" fontWeight="bold">ROOF</text>
            
            {/* Floor 2 section */}
            <rect x="30" y="70" width="140" height="70" fill={`${COLORS.amber}10`} />
            <line x1="30" y1="70" x2="170" y2="70" stroke={COLORS.emerald} strokeWidth="1" strokeDasharray="4,2" />
            <text x="100" y="85" textAnchor="middle" fill={COLORS.amber} fontSize="8" fontWeight="bold">FLOOR 2</text>
            
            {/* Floor 1 section */}
            <rect x="30" y="140" width="140" height="80" fill={`${COLORS.blue}10`} />
            <line x1="30" y1="140" x2="170" y2="140" stroke={COLORS.emerald} strokeWidth="1" strokeDasharray="4,2" />
            <text x="100" y="155" textAnchor="middle" fill={COLORS.blue} fontSize="8" fontWeight="bold">FLOOR 1</text>
            
            {/* Water Tank on Roof */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <rect x="45" y="42" width="30" height="22" rx="2" fill={COLORS.blue} opacity="0.8" />
              <text x="60" y="56" textAnchor="middle" fill="white" fontSize="5">TANK</text>
            </motion.g>
            
            {/* Cooling Unit on Roof */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <rect x="125" y="42" width="30" height="22" rx="2" fill={COLORS.teal} opacity="0.8" />
              <circle cx="140" cy="53" r="6" fill="none" stroke="white" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="0 140 53" to="360 140 53" dur="2s" repeatCount="indefinite" />
              </circle>
            </motion.g>
            
            {/* Electrical Panel Floor 2 */}
            <motion.g
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <rect x="45" y="95" width="25" height="35" rx="2" fill={COLORS.amber} opacity="0.8" />
              <line x1="50" y1="105" x2="65" y2="105" stroke="white" strokeWidth="1" />
              <line x1="50" y1="112" x2="65" y2="112" stroke="white" strokeWidth="1" />
              <line x1="50" y1="119" x2="65" y2="119" stroke="white" strokeWidth="1" />
            </motion.g>
            
            {/* Lighting Floor 2 */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <rect x="130" y="100" width="25" height="8" rx="2" fill={COLORS.amber} opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <line x1="142" y1="108" x2="142" y2="125" stroke={COLORS.amber} strokeWidth="1" strokeDasharray="2,2" />
            </motion.g>
            
            {/* Pump Floor 1 */}
            <motion.g
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <circle cx="60" cy="185" r="15" fill={COLORS.emerald} opacity="0.8" />
              <circle cx="60" cy="185" r="8" fill={COLORS.deepGreen} />
              <motion.line 
                x1="52" y1="185" x2="68" y2="185" 
                stroke="white" 
                strokeWidth="2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "60px 185px" }}
              />
            </motion.g>
            
            {/* Water Supply Pipes */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {/* Vertical pipe */}
              <rect x="138" y="165" width="8" height="45" rx="2" fill={COLORS.blue} opacity="0.7" />
              {/* Horizontal pipe */}
              <rect x="100" y="180" width="40" height="6" rx="2" fill={COLORS.blue} opacity="0.7" />
              {/* Flow indicator */}
              <circle cx="120" cy="183" r="2" fill="white">
                <animate attributeName="cx" values="105;135;105" dur="2s" repeatCount="indefinite" />
              </circle>
            </motion.g>
            
            {/* Connecting lines (pipes/wires) */}
            <motion.path
              d="M60 42 L60 170"
              stroke={COLORS.blue}
              strokeWidth="2"
              strokeDasharray="4,4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.7, duration: 1 }}
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
          MEP Systems Builder
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base mb-4"
          style={{ color: `${COLORS.coolWhite}70` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Build complete building infrastructure
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
        
        {/* Floor indicators */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${COLORS.blue}20` }}>
            <span className="text-xs" style={{ color: COLORS.blue }}>💧 Plumbing</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${COLORS.amber}20` }}>
            <span className="text-xs" style={{ color: COLORS.amber }}>⚡ Electrical</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${COLORS.emerald}20` }}>
            <span className="text-xs" style={{ color: COLORS.emerald }}>🔧 Mechanical</span>
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
            Loading building systems...
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
