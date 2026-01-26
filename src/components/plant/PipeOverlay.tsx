/**
 * PipeOverlay - Apple-inspired SVG overlay for elegant pipe connections
 * 
 * Design Philosophy:
 * - Smooth, flowing curves with refined bezier paths
 * - Subtle gradient fills that catch light
 * - Soft glow effects with layered shadows
 * - Animated flow particles for active connections
 * - Clean, minimal connection nodes
 * 
 * Brand Colors:
 * - #FAE452 (yellow) - active/valid connections
 * - #2A6BB5 (blue) - pending/ghost connections
 */

"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { 
  SECTOR_REQUIRED_SLOTS, 
  SLOT_ORDER,
  type SlotId, 
  type SectorKey 
} from "./rules";

// ============================================
// TYPES
// ============================================
interface CanvasItem {
  id: string;
  componentId: string;
  x: number;
  y: number;
}

interface SlotState {
  [slotId: string]: string | null;
}

interface PipeSegment {
  id: string;
  type: "solid" | "ghost";
  from: { x: number; y: number; slotId: string };
  to: { x: number; y: number; slotId: string };
}

interface PipeOverlayProps {
  sector: string;
  slots: SlotState;
  canvasItems: CanvasItem[];
  onWarning?: (warning: string) => void;
}

// ============================================
// DESIGN TOKENS - Apple-inspired palette
// ============================================
const DESIGN = {
  // Active connection - warm golden yellow
  active: {
    primary: "#FAE452",
    secondary: "#FFF9E0",
    glow: "#FAE452",
  },
  // Pending connection - cool blue
  pending: {
    primary: "#2A6BB5",
    secondary: "#4A9BE8",
    glow: "#2A6BB5",
  },
} as const;

// ============================================
// HELPER: Normalize sector name
// ============================================
function normalizeSector(sector: string): SectorKey {
  const normalized = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "") || "";
  const sectorMap: Record<string, SectorKey> = {
    "process": "process",
    "hvac": "hvac",
    "oil&gas": "oilgas",
    "oilgas": "oilgas",
    "electrical": "electrical",
    "mep": "mep"
  };
  return sectorMap[normalized] || "process";
}

// ============================================
// HELPER: Get pipe chain for sector
// ============================================
function getPipeChainForSector(sector: string): SlotId[] {
  const key = normalizeSector(sector);
  return SECTOR_REQUIRED_SLOTS[key] || SLOT_ORDER;
}

// ============================================
// HELPER: Generate smooth cubic bezier path
// ============================================
function generateSmoothPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 3) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  
  // Calculate control points for smooth S-curve
  const tension = 0.4;
  const cp1x = from.x + dx * tension;
  const cp1y = from.y;
  const cp2x = to.x - dx * tension;
  const cp2y = to.y;
  
  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

// ============================================
// PIPE OVERLAY COMPONENT
// ============================================
export function PipeOverlay({ 
  sector, 
  slots, 
  canvasItems, 
  onWarning 
}: PipeOverlayProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  // Calculate pipe segments
  const { segments, warnings } = useMemo(() => {
    const segs: PipeSegment[] = [];
    const warns: string[] = [];
    
    const pipeChain = getPipeChainForSector(sector);
    
    // Build componentId → position map
    const componentPositions: Record<string, { x: number; y: number; id: string }> = {};
    for (const item of canvasItems) {
      if (!componentPositions[item.componentId]) {
        componentPositions[item.componentId] = {
          x: item.x,
          y: item.y,
          id: item.id,
        };
      }
    }
    
    // Build chain nodes
    const chainNodes: Array<{
      slotId: SlotId;
      componentId: string | null;
      x: number | null;
      y: number | null;
      isPlaced: boolean;
    }> = [];
    
    for (const slotId of pipeChain) {
      const componentId = slots[slotId] || null;
      const position = componentId ? componentPositions[componentId] : null;
      
      chainNodes.push({
        slotId,
        componentId,
        x: position?.x ?? null,
        y: position?.y ?? null,
        isPlaced: position !== null,
      });
    }
    
    // Create segments between consecutive nodes
    for (let i = 0; i < chainNodes.length - 1; i++) {
      const from = chainNodes[i];
      const to = chainNodes[i + 1];
      
      const fromPlaced = from.isPlaced && from.x !== null && from.y !== null;
      const toPlaced = to.isPlaced && to.x !== null && to.y !== null;
      
      if (fromPlaced && toPlaced) {
        segs.push({
          id: `pipe-${from.slotId}-${to.slotId}`,
          type: "solid",
          from: { x: from.x!, y: from.y!, slotId: from.slotId },
          to: { x: to.x!, y: to.y!, slotId: to.slotId },
        });
      } else if (fromPlaced && !toPlaced) {
        const ghostX = Math.min(from.x! + 15, 95);
        segs.push({
          id: `ghost-${from.slotId}-${to.slotId}`,
          type: "ghost",
          from: { x: from.x!, y: from.y!, slotId: from.slotId },
          to: { x: ghostX, y: from.y!, slotId: to.slotId },
        });
        warns.push(`${to.slotId}: Awaiting component`);
      } else if (!fromPlaced && toPlaced) {
        const ghostX = Math.max(to.x! - 15, 5);
        segs.push({
          id: `ghost-${from.slotId}-${to.slotId}`,
          type: "ghost",
          from: { x: ghostX, y: to.y!, slotId: from.slotId },
          to: { x: to.x!, y: to.y!, slotId: to.slotId },
        });
        warns.push(`${from.slotId}: Awaiting component`);
      }
    }
    
    return { segments: segs, warnings: warns };
  }, [sector, slots, canvasItems]);
  
  // Warning reporting
  const reportedWarningsRef = useRef<string>("");
  
  useEffect(() => {
    if (!onWarning) return;
    const warningsKey = warnings.sort().join("|");
    if (warningsKey !== reportedWarningsRef.current && warnings.length > 0) {
      reportedWarningsRef.current = warningsKey;
      [...new Set(warnings)].forEach(w => onWarning(w));
    }
  }, [warnings, onWarning]);

  if (!mounted) return null;
  
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Gradient for active pipes - golden shimmer */}
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={DESIGN.active.secondary} stopOpacity="0.9" />
          <stop offset="50%" stopColor={DESIGN.active.primary} stopOpacity="1" />
          <stop offset="100%" stopColor={DESIGN.active.secondary} stopOpacity="0.9" />
        </linearGradient>
        
        {/* Gradient for pending pipes - blue fade */}
        <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={DESIGN.pending.primary} stopOpacity="0.3" />
          <stop offset="50%" stopColor={DESIGN.pending.secondary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={DESIGN.pending.primary} stopOpacity="0.3" />
        </linearGradient>
        
        {/* Soft outer glow for active pipes */}
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Subtle shadow for depth */}
        <filter id="pipeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0.3" stdDeviation="0.4" floodColor="#000" floodOpacity="0.15" />
        </filter>
        
        {/* Elegant arrow marker for active connections */}
        <marker
          id="activeArrow"
          markerWidth="4"
          markerHeight="4"
          refX="3"
          refY="2"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0.5 0.5 L 0.5 3.5 L 3.5 2 Z"
            fill={DESIGN.active.primary}
            fillOpacity="0.9"
          />
        </marker>
        
        {/* Subtle arrow for pending connections */}
        <marker
          id="pendingArrow"
          markerWidth="3"
          markerHeight="3"
          refX="2"
          refY="1.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0.3 0.3 L 0.3 2.7 L 2.7 1.5 Z"
            fill={DESIGN.pending.secondary}
            fillOpacity="0.6"
          />
        </marker>
      </defs>
      
      {/* Global CSS animations */}
      <style>
        {`
          @keyframes pipeFlowAnimation {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -10; }
          }
          @keyframes pipePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.7; }
          }
          @keyframes pipeFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      
      {/* Render pipe segments with staggered animation */}
      {segments.map((seg, index) => (
        <PipeSegmentSVG 
          key={seg.id} 
          segment={seg} 
          index={index}
        />
      ))}
    </svg>
  );
}

// ============================================
// PIPE SEGMENT - Apple-inspired rendering
// ============================================
interface PipeSegmentSVGProps {
  segment: PipeSegment;
  index: number;
}

function PipeSegmentSVG({ segment, index }: PipeSegmentSVGProps) {
  const { type, from, to } = segment;
  const isActive = type === "solid";
  
  const pathD = generateSmoothPath(from, to);
  
  return (
    <g 
      style={{ 
        opacity: 1,
        animation: `pipeFadeIn 0.4s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Shadow layer for depth */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={isActive ? 0.6 : 0.3}
        strokeLinecap="round"
        transform="translate(0.1, 0.2)"
      />
      
      {isActive ? (
        <>
          {/* Outer glow - soft bloom effect */}
          <path
            d={pathD}
            fill="none"
            stroke={DESIGN.active.glow}
            strokeWidth="1.8"
            strokeOpacity="0.15"
            strokeLinecap="round"
            filter="url(#softGlow)"
          />
          
          {/* Middle glow layer */}
          <path
            d={pathD}
            fill="none"
            stroke={DESIGN.active.primary}
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          
          {/* Main pipe - gradient stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#activeGradient)"
            strokeWidth="0.5"
            strokeLinecap="round"
            markerEnd="url(#activeArrow)"
            filter="url(#pipeShadow)"
          />
          
          {/* Animated flow indicator */}
          <path
            d={pathD}
            fill="none"
            stroke={DESIGN.active.primary}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeOpacity="0.5"
            strokeDasharray="1.5 3"
            style={{
              animation: `pipeFlowAnimation 1.5s linear infinite`
            }}
          />
        </>
      ) : (
        <>
          {/* Ghost pipe - subtle dashed line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#pendingGradient)"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="1.5 1"
            markerEnd="url(#pendingArrow)"
            style={{
              animation: `pipePulse 2s ease-in-out infinite`
            }}
          />
        </>
      )}
      
      {/* Connection node - FROM */}
      <g>
        {/* Outer ring glow */}
        {isActive && (
          <circle
            cx={from.x}
            cy={from.y}
            r="1.8"
            fill="none"
            stroke={DESIGN.active.glow}
            strokeWidth="0.3"
            strokeOpacity="0.2"
          />
        )}
        {/* Inner filled circle */}
        <circle
          cx={from.x}
          cy={from.y}
          r={isActive ? 1 : 0.6}
          fill={isActive ? DESIGN.active.primary : DESIGN.pending.primary}
          fillOpacity={isActive ? 0.9 : 0.4}
        />
        {/* Center highlight - Apple-style specular */}
        {isActive && (
          <circle
            cx={from.x - 0.2}
            cy={from.y - 0.2}
            r="0.3"
            fill="white"
            fillOpacity="0.6"
          />
        )}
      </g>
      
      {/* Connection node - TO */}
      <g>
        {isActive && (
          <circle
            cx={to.x}
            cy={to.y}
            r="1.8"
            fill="none"
            stroke={DESIGN.active.glow}
            strokeWidth="0.3"
            strokeOpacity="0.2"
          />
        )}
        <circle
          cx={to.x}
          cy={to.y}
          r={isActive ? 1 : 0.6}
          fill={isActive ? DESIGN.active.primary : DESIGN.pending.primary}
          fillOpacity={isActive ? 0.9 : 0.4}
        />
        {isActive && (
          <circle
            cx={to.x - 0.2}
            cy={to.y - 0.2}
            r="0.3"
            fill="white"
            fillOpacity="0.6"
          />
        )}
      </g>
    </g>
  );
}

export default PipeOverlay;
