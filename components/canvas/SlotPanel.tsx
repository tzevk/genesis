"use client";

/**
 * SlotPanel - Drop target slots for engineering components
 * 
 * Features:
 * - 8 slots following engineering sequence (SOURCE → CONTROL)
 * - Native HTML5 drag/drop support (onDragOver, onDrop)
 * - Validates drops using rules.js validateSlotDrop
 * - Shows component label when assigned, with clear action
 * - Progress bar based on computePlantStatus
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo) - primary backgrounds
 * - #2A6BB5 (blue) - borders, secondary
 * - #FAE452 (yellow) - active states, highlights
 * - #FFFFFF (white) - text
 */

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SLOT_ORDER,
  SLOT_DISPLAY_NAMES,
  computePlantStatus,
  type SlotId,
} from "../../src/components/plant/rules";
import { getComponentById, ICONS } from "../../src/components/plant/catalog";

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
export interface SlotState {
  [slotId: string]: string | null;
}

export interface PlantStatus {
  complete: boolean;
  score: number;
  warnings: string[];
  progress: number;
  filledSlots: number;
  totalSlots: number;
}

interface CatalogComponent {
  id: string;
  label: string;
  slot: string;
  slotHint: string;
  category: string;
  icon: string;
  sectorTags: string[];
}

interface SlotPanelProps {
  /** Current sector (process, hvac, etc.) */
  sector: string;
  /** Current slot assignments */
  slots: SlotState;
  /** Callback when a component is dropped */
  onSlotDrop: (slotId: string, componentId: string) => void;
  /** Callback when a slot is cleared */
  onSlotClear: (slotId: string) => void;
  /** Callback to add validation message */
  onMessage: (type: "success" | "error" | "warning", message: string) => void;
}

// ============================================
// SLOT CARD COMPONENT
// Individual drop target slot
// ============================================
interface SlotCardProps {
  slotId: string;
  slotName: string;
  slotIndex: number;
  componentId: string | null;
  onDrop: (slotId: string, componentId: string) => void;
  onClear: (slotId: string) => void;
  onMessage: (type: "success" | "error" | "warning", message: string) => void;
}

function SlotCard({
  slotId,
  slotName,
  slotIndex,
  componentId,
  onDrop,
  onClear,
  onMessage,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isError, setIsError] = useState(false);
  const isFilled = componentId !== null;

  // Get component info if slot is filled
  const component = isFilled ? getComponentById(componentId) as CatalogComponent | undefined : null;
  const componentLabel = component?.label || componentId;
  const iconSvg = component ? (ICONS[component.icon as keyof typeof ICONS] || ICONS.tank) : null;

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedComponentId = e.dataTransfer.getData("componentId");
    if (!droppedComponentId) return;

    // Look up the component to get its slot
    const droppedComponent = getComponentById(droppedComponentId) as CatalogComponent | undefined;
    
    if (!droppedComponent) {
      onMessage("error", "Unknown component");
      setIsError(true);
      setTimeout(() => setIsError(false), 600);
      return;
    }

    // Validate the drop - check if component's slot matches target slot
    if (droppedComponent.slot !== slotId) {
      onMessage("error", `${droppedComponent.label} belongs in ${droppedComponent.slot}, not ${slotId}`);
      setIsError(true);
      setTimeout(() => setIsError(false), 600);
      return;
    }

    // Valid drop
    onDrop(slotId, droppedComponentId);
    onMessage("success", `${droppedComponent.label} placed in ${slotName}`);
  }, [slotId, slotName, onDrop, onMessage]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClear(slotId);
    onMessage("success", `Cleared ${slotName}`);
  }, [slotId, slotName, onClear, onMessage]);

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative p-2.5 rounded-lg transition-all duration-200"
      style={{
        background: isFilled 
          ? `${BRAND.blue}25` 
          : isDragOver 
            ? `${BRAND.yellow}15` 
            : `${BRAND.blue}10`,
        border: isError 
          ? `2px solid #FF4444` 
          : isFilled 
            ? `1px solid ${BRAND.yellow}40` 
            : isDragOver 
              ? `2px dashed ${BRAND.yellow}` 
              : `1px dashed ${BRAND.blue}40`,
        boxShadow: isError 
          ? `0 0 12px #FF444440` 
          : isDragOver 
            ? `0 0 8px ${BRAND.yellow}30` 
            : "none",
      }}
      animate={{
        scale: isDragOver ? 1.02 : 1,
        x: isError ? [0, -4, 4, -4, 4, 0] : 0,
      }}
      transition={{ duration: isError ? 0.4 : 0.15 }}
    >
      {/* Slot number badge */}
      <div
        className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{
          background: isFilled ? BRAND.yellow : `${BRAND.blue}80`,
          color: isFilled ? BRAND.indigo : BRAND.white,
        }}
      >
        {slotIndex + 1}
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 ml-3">
        {/* Icon area */}
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ 
            background: isFilled ? `${BRAND.indigo}` : `${BRAND.indigo}60`,
          }}
        >
          {isFilled && iconSvg ? (
            <div
              className="w-5 h-5"
              style={{ color: BRAND.yellow }}
              dangerouslySetInnerHTML={{ __html: iconSvg }}
            />
          ) : (
            <svg
              className="w-4 h-4"
              style={{ color: `${BRAND.white}40` }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[11px] font-medium truncate"
            style={{ color: isFilled ? BRAND.yellow : `${BRAND.white}90` }}
          >
            {isFilled ? componentLabel : slotName}
          </div>
          {!isFilled && (
            <div
              className="text-[9px] truncate"
              style={{ color: `${BRAND.white}50` }}
            >
              Drop component
            </div>
          )}
          {isFilled && (
            <div
              className="text-[9px] truncate"
              style={{ color: `${BRAND.white}60` }}
            >
              {slotName}
            </div>
          )}
        </div>

        {/* Clear button */}
        {isFilled && (
          <motion.button
            onClick={handleClear}
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: `${BRAND.blue}40`,
            }}
            whileHover={{
              background: "#FF444460",
            }}
            whileTap={{ scale: 0.9 }}
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
      </div>

      {/* Drag over indicator */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${BRAND.yellow}10, transparent)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN SLOT PANEL COMPONENT
// ============================================
export function SlotPanel({
  sector,
  slots,
  onSlotDrop,
  onSlotClear,
  onMessage,
}: SlotPanelProps) {
  // Calculate plant status using useMemo (avoids cascading renders)
  const status = useMemo((): PlantStatus => {
    if (!sector) {
      return {
        complete: false,
        score: 0,
        warnings: [],
        progress: 0,
        filledSlots: 0,
        totalSlots: SLOT_ORDER.length,
      };
    }
    
    const placed = Object.values(slots).filter(Boolean) as string[];
    const computed = computePlantStatus({
      sector,
      slots,
      placed,
      mode: "standard",
    }) as PlantStatus;
    
    return computed;
  }, [sector, slots]);

  return (
    <motion.div
      className="h-full flex flex-col rounded-xl overflow-hidden"
      style={{
        background: `${BRAND.indigo}`,
        border: `1px solid ${BRAND.blue}40`,
      }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-3 py-2 flex items-center justify-between"
        style={{
          borderBottom: `1px solid ${BRAND.blue}30`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5"
            style={{ color: BRAND.yellow }}
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
            }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: BRAND.white }}
          >
            Build Slots
          </span>
        </div>
        
        {/* Score badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{
            background: `${BRAND.blue}40`,
          }}
        >
          <span
            className="text-[10px] font-medium"
            style={{ color: `${BRAND.white}70` }}
          >
            Score
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: BRAND.yellow }}
          >
            {status.score}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="flex-shrink-0 px-3 py-2"
        style={{ borderBottom: `1px solid ${BRAND.blue}20` }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] font-medium"
            style={{ color: `${BRAND.white}70` }}
          >
            Progress
          </span>
          <span
            className="text-[10px] font-bold"
            style={{ color: BRAND.yellow }}
          >
            {status.filledSlots}/{status.totalSlots}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: `${BRAND.blue}30` }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ 
              background: status.complete 
                ? `linear-gradient(90deg, ${BRAND.yellow}, #4ADE80)` 
                : BRAND.yellow 
            }}
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Slots container - scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {SLOT_ORDER.map((slotId: SlotId, index: number) => (
          <SlotCard
            key={slotId}
            slotId={slotId}
            slotName={SLOT_DISPLAY_NAMES[slotId as keyof typeof SLOT_DISPLAY_NAMES]}
            slotIndex={index}
            componentId={slots[slotId] || null}
            onDrop={onSlotDrop}
            onClear={onSlotClear}
            onMessage={onMessage}
          />
        ))}
      </div>

      {/* Status footer */}
      <div
        className="flex-shrink-0 px-3 py-2"
        style={{ borderTop: `1px solid ${BRAND.blue}20` }}
      >
        {status.complete ? (
          <div
            className="flex items-center justify-center gap-2 py-1 rounded"
            style={{ background: `${BRAND.yellow}20` }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: BRAND.yellow }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span
              className="text-xs font-semibold"
              style={{ color: BRAND.yellow }}
            >
              Plant Complete
            </span>
          </div>
        ) : (
          <p
            className="text-[10px] text-center"
            style={{ color: `${BRAND.white}50` }}
          >
            Drop components into slots to build
          </p>
        )}
      </div>
    </motion.div>
  );
}
