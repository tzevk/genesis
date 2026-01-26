"use client";

/**
 * PlacedComponentNode - A component that has been placed on the canvas
 * Displays with animation and shows sequence number
 */

import { motion } from "framer-motion";
import type { PlacedComponent } from "./types";
import { COMPONENT_SIZE } from "./constants";

interface PlacedComponentNodeProps {
  /** The placed component data */
  component: PlacedComponent;
  /** Sector accent color */
  sectorColor: string;
}

export function PlacedComponentNode({ component, sectorColor }: PlacedComponentNodeProps) {
  return (
    <motion.div
      className="absolute z-20"
      style={{ 
        left: component.x, 
        top: component.y,
        width: COMPONENT_SIZE,
        height: COMPONENT_SIZE,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div 
        className="w-full h-full rounded-2xl flex flex-col items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${sectorColor}30, ${sectorColor}10)`,
          border: `2px solid ${sectorColor}`,
          boxShadow: `0 0 20px ${sectorColor}40`,
        }}
      >
        {/* Component emoji */}
        <span className="text-3xl">{component.emoji}</span>
        
        {/* Component name */}
        <span className="text-[10px] text-white/70 mt-1 text-center px-1 truncate w-full">
          {component.name}
        </span>
        
        {/* Sequence number badge */}
        <div 
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: sectorColor, color: "#000" }}
        >
          {component.slotIndex + 1}
        </div>
      </div>
    </motion.div>
  );
}
