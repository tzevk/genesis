"use client";

/**
 * WelcomeOverlay - Initial loading screen shown when canvas opens
 * Displays sector info and instructions
 */

import { motion } from "framer-motion";

interface WelcomeOverlayProps {
  /** User's selected sector */
  sector: string;
  /** Sector accent color */
  sectorColor: string;
}

export function WelcomeOverlay({ sector, sectorColor }: WelcomeOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10, 10, 26, 0.98)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="text-center" 
        initial={{ scale: 0.9 }} 
        animate={{ scale: 1 }}
      >
        {/* Icon */}
        <div className="text-6xl mb-4">🏭</div>
        
        {/* Title */}
        <h1 className="text-3xl font-semibold text-white mb-2">
          Hybrid Plant Builder
        </h1>
        
        {/* Sector name */}
        <p className="text-lg" style={{ color: sectorColor }}>
          {sector}
        </p>
        
        {/* Instructions */}
        <p className="text-sm text-white/50 mt-2">
          Drag components → Drop on blueprint → Auto-connect
        </p>
      </motion.div>
    </motion.div>
  );
}
