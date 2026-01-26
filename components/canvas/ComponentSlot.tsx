"use client";

/**
 * ComponentSlot - A draggable slot in the left panel
 * Represents a single engineering component that can be dragged to the canvas
 */

import { motion } from "framer-motion";
import type { ComponentDefinition } from "./types";

interface ComponentSlotProps {
  /** Component definition */
  component: ComponentDefinition;
  /** Slot index (0-based) */
  index: number;
  /** Whether this component has been placed */
  isPlaced: boolean;
  /** Whether this component can be dragged */
  canDrag: boolean;
  /** Validation reason if can't drag */
  validationReason: string;
  /** Sector accent color */
  sectorColor: string;
  /** Drag start handler */
  onDragStart: (componentId: string, e: React.MouseEvent | React.TouchEvent) => void;
}

export function ComponentSlot({
  component,
  index,
  isPlaced,
  canDrag,
  sectorColor,
  onDragStart,
}: ComponentSlotProps) {
  /**
   * Handle mouse/touch down to initiate drag
   * Only triggers if component can be dragged
   */
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (canDrag) {
      onDragStart(component.id, e);
    }
  };

  return (
    <motion.div
      className="relative p-3 rounded-xl transition-all select-none"
      style={{
        // Visual styling based on placement state
        background: isPlaced 
          ? `${sectorColor}20`
          : canDrag 
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.02)",
        border: isPlaced 
          ? `2px solid ${sectorColor}`
          : canDrag
            ? "2px solid rgba(255, 255, 255, 0.15)"
            : "2px dashed rgba(255, 255, 255, 0.08)",
        cursor: canDrag ? "grab" : "default",
        opacity: isPlaced ? 0.5 : 1,
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      whileHover={canDrag ? { scale: 1.02, borderColor: sectorColor } : {}}
    >
      {/* Slot number badge - shows checkmark when placed */}
      <div 
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ 
          background: isPlaced ? sectorColor : "rgba(255,255,255,0.1)",
          color: isPlaced ? "#000" : "rgba(255,255,255,0.5)",
        }}
      >
        {isPlaced ? "✓" : index + 1}
      </div>
      
      {/* Component info */}
      <div className="flex items-center gap-3 ml-4">
        <span className="text-2xl">{component.emoji}</span>
        <div>
          <div className="text-sm font-medium text-white">{component.name}</div>
          <div className="text-xs text-white/40">{component.description}</div>
        </div>
      </div>
      
      {/* Drag hint - only shown when component is ready to drag */}
      {canDrag && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-xs">
          DRAG →
        </div>
      )}
    </motion.div>
  );
}
