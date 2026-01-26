"use client";

/**
 * PipeSvg - SVG component for rendering pipe connections between components
 * Includes animated flow particles and arrow markers
 */

import { motion } from "framer-motion";
import type { PipeConnection } from "./types";

interface PipeSvgProps {
  /** Array of pipe connections to render */
  pipes: PipeConnection[];
  /** Sector accent color for pipe styling */
  sectorColor: string;
}

export function PipeSvg({ pipes, sectorColor }: PipeSvgProps) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {/* SVG definitions for arrow markers */}
      <defs>
        <marker
          id="pipe-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={sectorColor} />
        </marker>
      </defs>
      
      {/* Render each pipe connection */}
      {pipes.map((pipe) => {
        // Calculate bezier curve control point (midpoint for smooth curve)
        const midX = (pipe.fromX + pipe.toX) / 2;
        const midY = (pipe.fromY + pipe.toY) / 2;
        
        // SVG path for quadratic bezier curve
        const pathD = `M ${pipe.fromX} ${pipe.fromY} Q ${midX} ${pipe.fromY}, ${midX} ${midY} T ${pipe.toX} ${pipe.toY}`;
        
        return (
          <motion.g 
            key={pipe.id} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow effect (wider, semi-transparent stroke) */}
            <path
              d={pathD}
              fill="none"
              stroke={sectorColor}
              strokeWidth="6"
              strokeOpacity="0.2"
              strokeLinecap="round"
            />
            
            {/* Main pipe line with animated draw effect */}
            <motion.path
              d={pathD}
              fill="none"
              stroke={sectorColor}
              strokeWidth="3"
              strokeLinecap="round"
              markerEnd="url(#pipe-arrowhead)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Animated flow particle */}
            <motion.circle
              r="4"
              fill={sectorColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={pathD}
              />
            </motion.circle>
          </motion.g>
        );
      })}
    </svg>
  );
}
