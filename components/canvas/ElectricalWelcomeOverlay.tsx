"use client";

import { motion } from "framer-motion";

const COLORS = {
  amber: "#F59E0B",
  yellow: "#EAB308",
  orange: "#F97316",
  darkAmber: "#78350F",
  deepAmber: "#451A03",
  coolWhite: "#FFFBEB",
  glass: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
};

interface ElectricalWelcomeOverlayProps {
  onComplete: () => void;
}

export default function ElectricalWelcomeOverlay({ onComplete }: ElectricalWelcomeOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: `linear-gradient(180deg, ${COLORS.deepAmber} 0%, #1a0a00 50%, #0a0500 100%)` }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="elecGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke={COLORS.amber} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#elecGrid)" />
        </svg>
      </div>

      {/* Power flow animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-8 rounded-full"
            style={{ 
              background: `linear-gradient(to bottom, transparent, ${COLORS.amber}, transparent)`,
              left: `${(i * 5.3 + 7) % 100}%`,
            }}
            initial={{ y: "-10%", opacity: 0 }}
            animate={{ y: "110%", opacity: [0, 1, 1, 0] }}
            transition={{ 
              duration: 2 + (i % 3) * 0.5, 
              repeat: Infinity, 
              delay: (i % 7) * 0.3,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        {/* Power symbol animation */}
        <motion.div 
          className="w-32 h-32 mx-auto mb-6 relative"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {/* Outer ring */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={COLORS.amber} 
              strokeWidth="2" 
              opacity="0.3"
            />
            <motion.circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={COLORS.amber} 
              strokeWidth="3"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            {/* Lightning bolt */}
            <motion.path 
              d="M55 25 L40 50 L50 50 L45 75 L60 45 L50 45 L55 25"
              fill={COLORS.amber}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ transformOrigin: "50px 50px" }}
            />
          </svg>
          
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${COLORS.amber}30 0%, transparent 70%)` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-3xl font-bold mb-2"
          style={{ color: COLORS.coolWhite }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Power Quality Optimizer
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-sm mb-6"
          style={{ color: `${COLORS.coolWhite}70` }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Maintain Power Factor ≥ 0.95 while minimizing energy losses
        </motion.p>

        {/* Power system schematic preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl mb-6"
          style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
        >
          <div className="flex justify-between items-center gap-2">
            {/* Supply */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.amber}20` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-[9px] mt-1" style={{ color: `${COLORS.coolWhite}60` }}>Supply</span>
            </div>

            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1" opacity="0.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>

            {/* Loads */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.orange}20` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.orange} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="text-[9px] mt-1" style={{ color: `${COLORS.coolWhite}60` }}>Loads</span>
            </div>

            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1" opacity="0.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>

            {/* Optimization */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.yellow}20` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.yellow} strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-[9px] mt-1" style={{ color: `${COLORS.coolWhite}60` }}>Quality</span>
            </div>
          </div>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4 mb-8"
        >
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: `${COLORS.amber}20` }}>
            <div className="text-xl font-bold" style={{ color: COLORS.amber }}>0.95+</div>
            <div className="text-[10px]" style={{ color: `${COLORS.coolWhite}60` }}>Target PF</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: `${COLORS.orange}20` }}>
            <div className="text-xl font-bold" style={{ color: COLORS.orange }}>&lt;5%</div>
            <div className="text-[10px]" style={{ color: `${COLORS.coolWhite}60` }}>Target THD</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: `${COLORS.yellow}20` }}>
            <div className="text-xl font-bold" style={{ color: COLORS.yellow }}>7</div>
            <div className="text-[10px]" style={{ color: `${COLORS.coolWhite}60` }}>Components</div>
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={onComplete}
          className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.orange})`,
            color: COLORS.deepAmber,
            boxShadow: `0 4px 30px ${COLORS.amber}40`,
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Start Optimization
        </motion.button>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 flex items-center justify-center gap-2"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: COLORS.amber }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: `${COLORS.coolWhite}50` }}>System initializing...</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
