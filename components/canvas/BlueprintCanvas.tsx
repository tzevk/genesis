"use client";

/**
 * BlueprintCanvas - Center panel for placing engineering components
 * 
 * Features:
 * - Displays components auto-placed from slot assignments
 * - Renders placed items as draggable nodes
 * - Selection outline and delete action for items
 * - Grid background with engineering blueprint style
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo) - primary backgrounds
 * - #2A6BB5 (blue) - grid, borders
 * - #FAE452 (yellow) - highlights, active states
 * - #FFFFFF (white) - text
 */

import { forwardRef, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type CanvasItem } from "./types";
import { getComponentById, ICONS } from "@/src/components/plant/catalog";
import { PipeOverlay } from "@/src/components/plant/PipeOverlay";

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
} as const;

// ============================================
// TYPES
// ============================================
interface BlueprintCanvasProps {
  /** User's name */
  userName: string;
  /** User's selected sector */
  sector: string;
  /** Whether user is currently dragging from toolbox */
  isDragging: boolean;
  /** Time remaining in seconds */
  timeLeft: number;
  /** Current slot assignments */
  slots: Record<string, string | null>;
  /** Items placed on canvas */
  canvasItems: CanvasItem[];
  /** Callback when item position is updated */
  onItemMove: (itemId: string, x: number, y: number) => void;
  /** Callback when item is deleted */
  onItemDelete: (itemId: string) => void;
  /** Callback to show validation message */
  onMessage: (type: "success" | "error" | "warning", message: string) => void;
  /** Callback when user clicks End button */
  onEnd: () => void;
}

// ============================================
// CANVAS ITEM NODE
// Draggable component on the canvas
// ============================================
interface CanvasItemNodeProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function CanvasItemNode({
  item,
  isSelected,
  onSelect,
  onMove,
  onDelete,
  containerRef,
}: CanvasItemNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; itemX: number; itemY: number } | null>(null);

  const component = getComponentById(item.componentId);
  const label = component?.label || item.componentId;
  const iconSvg = component ? (ICONS[component.icon as keyof typeof ICONS] || ICONS.tank) : ICONS.tank;

  // Handle pointer down - start drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(item.id);
    setIsDragging(true);
    
    const container = containerRef.current;
    if (!container) return;
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.x,
      itemY: item.y,
    };
    
    // Capture pointer
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [item.id, item.x, item.y, onSelect, containerRef]);

  // Handle pointer move - update position
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Convert to percentage
    const newX = dragStartRef.current.itemX + (deltaX / rect.width) * 100;
    const newY = dragStartRef.current.itemY + (deltaY / rect.height) * 100;
    
    // Clamp to bounds (with some padding)
    const clampedX = Math.max(5, Math.min(95, newX));
    const clampedY = Math.max(5, Math.min(95, newY));
    
    onMove(item.id, clampedX, clampedY);
  }, [isDragging, item.id, onMove, containerRef]);

  // Handle pointer up - end drag
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Handle delete
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  }, [item.id, onDelete]);

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 20 : 10,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isDragging ? 1.1 : 1, 
        opacity: 1,
      }}
      transition={{ duration: 0.2 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Main card */}
      <div
        className="relative flex flex-col items-center p-2 rounded-lg"
        style={{
          background: BRAND.indigo,
          border: `2px solid ${isSelected ? BRAND.yellow : BRAND.blue}`,
          boxShadow: isSelected 
            ? `0 0 16px ${BRAND.yellow}50, 0 4px 12px rgba(0,0,0,0.3)` 
            : `0 2px 8px rgba(0,0,0,0.2)`,
          minWidth: "64px",
        }}
      >
        {/* Icon */}
        <div
          className="w-8 h-8 flex items-center justify-center mb-1"
          style={{ color: isSelected ? BRAND.yellow : BRAND.white }}
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
        
        {/* Label */}
        <span
          className="text-[9px] font-medium text-center leading-tight max-w-[60px] truncate"
          style={{ color: isSelected ? BRAND.yellow : `${BRAND.white}CC` }}
        >
          {label}
        </span>

        {/* Delete button - only visible when selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.button
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: "#FF4444",
                border: `1px solid ${BRAND.white}40`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
            >
              <svg
                className="w-3 h-3"
                style={{ color: BRAND.white }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            border: `2px solid ${BRAND.yellow}`,
            margin: "-4px",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// ============================================
// MAIN BLUEPRINT CANVAS
// ============================================
export const BlueprintCanvas = forwardRef<HTMLDivElement, BlueprintCanvasProps>(
  function BlueprintCanvas(
    { 
      userName, 
      sector, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isDragging, // Reserved for external drag state indication
      timeLeft, 
      slots,
      canvasItems,
      onItemMove,
      onItemDelete,
      onMessage,
      onEnd,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Format timer
    const minutes = Math.floor(timeLeft / 60);
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    const isTimeLow = timeLeft <= 30;

    // Handle canvas click - deselect
    const handleCanvasClick = useCallback(() => {
      setSelectedItemId(null);
    }, []);

    // Handle item selection
    const handleSelectItem = useCallback((id: string) => {
      setSelectedItemId(id);
    }, []);

    // Handle item delete
    const handleDeleteItem = useCallback((id: string) => {
      onItemDelete(id);
      if (selectedItemId === id) {
        setSelectedItemId(null);
      }
    }, [onItemDelete, selectedItemId]);

    return (
      <motion.div
        className="h-full flex flex-col"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2 mb-2"
          style={{
            background: BRAND.indigo,
            border: `1px solid ${BRAND.blue}40`,
          }}
        >
          {/* User info */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${BRAND.yellow}20` }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: BRAND.yellow }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <h1
                className="text-xs font-semibold"
                style={{ color: BRAND.white }}
              >
                Blueprint Canvas
              </h1>
              <p
                className="text-[10px]"
                style={{ color: `${BRAND.white}60` }}
              >
                {userName} / {sector}
              </p>
            </div>
          </div>

          {/* End Button */}
          <button
            onClick={onEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: `${BRAND.blue}30`,
              border: `1px solid ${BRAND.blue}50`,
            }}
          >
            <svg
              className="w-3.5 h-3.5"
              style={{ color: BRAND.white }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span
              className="text-xs font-semibold"
              style={{ color: BRAND.white }}
            >
              End
            </span>
          </button>

          {/* Timer */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{
              background: isTimeLow ? `${BRAND.yellow}20` : `${BRAND.blue}20`,
              border: `1px solid ${isTimeLow ? BRAND.yellow : `${BRAND.blue}40`}`,
            }}
          >
            <svg
              className="w-3.5 h-3.5"
              style={{ color: isTimeLow ? BRAND.yellow : `${BRAND.white}70` }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className="text-sm font-bold font-mono"
              style={{ color: isTimeLow ? BRAND.yellow : BRAND.white }}
            >
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        {/* Canvas area */}
        <div
          ref={(el) => {
            // Handle both refs
            (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            if (typeof ref === "function") {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
          }}
          className="flex-1 rounded-xl relative overflow-hidden"
          style={{
            background: `${BRAND.indigo}80`,
            border: `2px solid ${BRAND.blue}40`,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onClick={handleCanvasClick}
        >
          {/* Blueprint grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(${BRAND.blue}15 1px, transparent 1px),
                linear-gradient(90deg, ${BRAND.blue}15 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Corner brackets */}
          <CornerBracket position="top-left" color={BRAND.blue} />
          <CornerBracket position="top-right" color={BRAND.blue} />
          <CornerBracket position="bottom-left" color={BRAND.blue} />
          <CornerBracket position="bottom-right" color={BRAND.blue} />

          {/* Empty state */}
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-30"
                  style={{ color: BRAND.blue }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <p
                  className="text-xs"
                  style={{ color: `${BRAND.white}50` }}
                >
                  Assign components to slots to build your plant
                </p>
              </div>
            </div>
          )}

          {/* Pipe connections overlay */}
          <PipeOverlay
            sector={sector}
            slots={slots}
            canvasItems={canvasItems}
            onWarning={(warn: string) => onMessage("warning", warn)}
          />

          {/* Placed items */}
          {canvasItems.map((item) => (
            <CanvasItemNode
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={handleSelectItem}
              onMove={onItemMove}
              onDelete={handleDeleteItem}
              containerRef={canvasRef}
            />
          ))}
        </div>
      </motion.div>
    );
  }
);

// ============================================
// CORNER BRACKET DECORATION
// ============================================
function CornerBracket({
  position,
  color,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color: string;
}) {
  const size = 20;
  const thickness = 2;

  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 8, left: 8 },
    "top-right": { top: 8, right: 8, transform: "rotate(90deg)" },
    "bottom-left": { bottom: 8, left: 8, transform: "rotate(-90deg)" },
    "bottom-right": { bottom: 8, right: 8, transform: "rotate(180deg)" },
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        ...positionStyles[position],
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: thickness,
          background: `${color}50`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: thickness,
          height: size,
          background: `${color}50`,
        }}
      />
    </div>
  );
}
