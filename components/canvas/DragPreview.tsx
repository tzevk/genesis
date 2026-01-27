"use client";

/**
 * DragPreview - Floating preview that follows cursor during drag
 * Shows the component being dragged with haptic-like visual feedback
 */

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
        // Center the preview on the cursor with smooth following
        left: position.x - COMPONENT_HALF,
        top: position.y - COMPONENT_HALF,
        transition: 'left 0.05s ease-out, top 0.05s ease-out',
      }}
    >
      {/* Outer glow ring - haptic feedback */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle, ${sectorColor}30 0%, transparent 70%)`,
          transform: 'scale(1.8)',
          animation: 'haptic-pulse 1s ease-out infinite',
        }}
      />
      
      {/* Main drag element */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${sectorColor}50 0%, ${sectorColor}30 100%)`,
          border: `3px solid ${sectorColor}`,
          boxShadow: `
            0 0 30px ${sectorColor}60,
            0 10px 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
          animation: 'magnetic-attract 0.4s ease-in-out infinite',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span 
          className="text-4xl"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {emoji}
        </span>
      </div>
      
      {/* Bottom shadow for depth */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
      />
    </div>
  );
}
