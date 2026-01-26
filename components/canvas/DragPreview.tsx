"use client";

/**
 * DragPreview - Floating preview that follows cursor during drag
 * Shows the component being dragged with visual feedback
 */

import { motion } from "framer-motion";
import { COMPONENT_HALF } from "./constants";

interface DragPreviewProps {
  /** Emoji of the component being dragged */
  emoji: string;
  /** Current drag position (cursor coordinates) */
  position: { x: number; y: number };
  /** Sector accent color */
  sectorColor: string;
}

export function DragPreview({ emoji, position, sectorColor }: DragPreviewProps) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        // Center the preview on the cursor
        left: position.x - COMPONENT_HALF,
        top: position.y - COMPONENT_HALF,
      }}
    >
      <motion.div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: `${sectorColor}40`,
          border: `3px solid ${sectorColor}`,
          boxShadow: `0 0 30px ${sectorColor}60`,
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
        transition={{ rotate: { duration: 0.3, repeat: Infinity } }}
      >
        <span className="text-4xl">{emoji}</span>
      </motion.div>
    </div>
  );
}
