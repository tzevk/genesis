"use client";

/**
 * CompletionOverlay - Success screen shown when all components are placed
 * Displays completion time and stats
 */

import { motion } from "framer-motion";
import { TIMER_DURATION } from "./constants";

interface CompletionOverlayProps {
  /** Time remaining when completed */
  timeLeft: number;
  /** Total number of components */
  totalComponents: number;
  /** Sector accent color */
  sectorColor: string;
}

export function CompletionOverlay({ 
  timeLeft, 
  totalComponents, 
  sectorColor 
}: CompletionOverlayProps) {
  // Calculate elapsed time
  const elapsedSeconds = TIMER_DURATION - timeLeft;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10, 10, 26, 0.95)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="text-center p-8 rounded-3xl"
        style={{ 
          background: `${sectorColor}20`, 
          border: `2px solid ${sectorColor}` 
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        {/* Celebration emoji */}
        <div className="text-7xl mb-4">🎉</div>
        
        {/* Title */}
        <h1 
          className="text-3xl font-bold mb-2" 
          style={{ color: sectorColor }}
        >
          Plant Complete!
        </h1>
        
        {/* Completion time */}
        <p className="text-white/70">
          Time: {minutes}:{seconds}
        </p>
        
        {/* Component count */}
        <p className="text-white/50 text-sm mt-2">
          All {totalComponents} components connected
        </p>
      </motion.div>
    </motion.div>
  );
}
