"use client";

/**
 * StatusPanel - Right sidebar showing plant status, score, warnings, and messages
 * 
 * Features:
 * - Plant status: Complete/Incomplete
 * - Score meter (0-100) from computePlantStatus
 * - Active warnings list
 * - Live message feed from messages (success/warn/error)
 * - Hints section: 1 contextual hint if plant is incomplete
 * - Reset Plant button: clears slots, placed items, messages
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 * - #FFFFFF (white)
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computePlantStatus, SLOT_ORDER, SLOT_DISPLAY_NAMES } from "./rules";

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
};

// ============================================
// HINT GENERATOR
// Deterministic hints based on missing slots/sequence
// ============================================
function generateHint(status, slots) {
  // Priority 1: No source defined - most critical
  if (!slots.SOURCE) {
    return {
      icon: "○",
      text: "Start by selecting a Source component - every plant needs an input feed",
      priority: "critical",
    };
  }

  // Priority 2: Missing pressurization after source
  if (slots.SOURCE && !slots.PRESSURIZATION) {
    return {
      icon: "○",
      text: "Add a pump, fan, or compressor to move fluids through the system",
      priority: "high",
    };
  }

  // Priority 3: Check sequence order - find first gap
  const missingInSequence = status.missingSlots?.[0];
  
  if (missingInSequence) {
    const slotName = SLOT_DISPLAY_NAMES[missingInSequence.id] || missingInSequence.id;
    const slotIndex = SLOT_ORDER.indexOf(missingInSequence.id);
    
    // Different hints based on slot type
    const hints = {
      THERMAL: {
        icon: "○",
        text: `Add thermal processing for temperature control`,
      },
      REACTION: {
        icon: "○",
        text: `Add a reactor or mixer for product conversion`,
      },
      SEPARATION: {
        icon: "○",
        text: `Add separation equipment for product purity`,
      },
      STORAGE: {
        icon: "○",
        text: `Add storage capacity for your processed material`,
      },
      SAFETY: {
        icon: "○",
        text: `Add safety systems to protect against overpressure`,
      },
      CONTROL: {
        icon: "○",
        text: `Add instrumentation for automated operation`,
      },
    };

    if (hints[missingInSequence.id]) {
      return {
        ...hints[missingInSequence.id],
        priority: slotIndex < 4 ? "high" : "medium",
      };
    }

    return {
      icon: "○",
      text: `Fill the ${slotName} slot to continue the sequence`,
      priority: "medium",
    };
  }

  // No specific hint needed
  return null;
}

// ============================================
// MESSAGE TYPE ICON
// ============================================
function getMessageIcon(type) {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "⚠";
    case "info":
    default:
      return "ℹ";
  }
}

// ============================================
// STATUS PANEL COMPONENT
// ============================================
export function StatusPanel({
  sector,
  slots,
  canvasItems,
  messages,
  onReset,
}) {
  // Compute plant status using rules engine
  const status = useMemo(() => {
    return computePlantStatus({
      sector: sector || "process",
      slots: slots || {},
      placed: canvasItems?.map((item) => item.componentId) || [],
      mode: "standard",
    });
  }, [sector, slots, canvasItems]);

  // Generate deterministic hint
  const hint = useMemo(() => {
    if (status.complete) return null;
    return generateHint(status, slots || {});
  }, [status, slots]);

  // Filter active warnings (non-empty)
  const activeWarnings = useMemo(() => {
    return (status.warnings || []).filter((w) => w && w.trim().length > 0);
  }, [status.warnings]);

  return (
    <motion.div
      className="h-full flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: `${BRAND.indigo}CC`,
        border: `1px solid ${BRAND.blue}40`,
      }}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${BRAND.blue}30` }}
      >
        <span className="text-sm font-semibold" style={{ color: BRAND.yellow }}>
          Plant Status
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* ======================================== 
            PLANT STATUS CARD
            Complete/Incomplete indicator
            ======================================== */}
        <div
          className="p-3 rounded-xl"
          style={{
            background: status.complete ? `${BRAND.yellow}20` : `${BRAND.blue}20`,
            border: `1px solid ${status.complete ? BRAND.yellow : `${BRAND.blue}40`}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: status.complete ? BRAND.yellow : BRAND.white }}
              >
                {status.complete ? "Plant Complete" : "Incomplete"}
              </p>
              <p className="text-[10px]" style={{ color: `${BRAND.blue}99` }}>
                {status.complete
                  ? "All required systems connected"
                  : `${status.filledSlots || 0}/${status.totalSlots || 8} slots filled`}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================== 
            SCORE METER
            0-100 based on computePlantStatus
            ======================================== */}
        <div
          className="p-3 rounded-xl"
          style={{
            background: `${BRAND.blue}20`,
            border: `1px solid ${BRAND.blue}40`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: `${BRAND.yellow}CC` }}>
              Plant Score
            </span>
            <span className="text-lg font-bold" style={{ color: BRAND.yellow }}>
              {Math.min(status.score || 0, 100)}
            </span>
          </div>
          {/* Score bar */}
          <div
            className="h-3 rounded-full overflow-hidden relative"
            style={{ background: `${BRAND.indigo}80` }}
          >
            <motion.div
              className="h-full absolute left-0 top-0"
              style={{
                background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.yellow})`,
                borderRadius: "9999px",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(status.score || 0, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Tick marks */}
            <div className="absolute inset-0 flex justify-between px-1">
              {[25, 50, 75].map((tick) => (
                <div
                  key={tick}
                  className="w-px h-full"
                  style={{
                    background: `${BRAND.white}20`,
                    marginLeft: `${tick}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ color: `${BRAND.blue}60` }}>
              0
            </span>
            <span className="text-[9px]" style={{ color: `${BRAND.blue}60` }}>
              100
            </span>
          </div>
        </div>

        {/* ======================================== 
            HINTS SECTION
            1 contextual hint if plant is incomplete
            ======================================== */}
        {hint && (
          <motion.div
            className="p-3 rounded-xl"
            style={{
              background: `${BRAND.yellow}10`,
              border: `1px solid ${BRAND.yellow}30`,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-1">
              <p
                className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                style={{ color: BRAND.yellow }}
              >
                Hint
              </p>
              <p className="text-xs" style={{ color: `${BRAND.white}CC` }}>
                {hint.text}
              </p>
            </div>
          </motion.div>
        )}

        {/* ======================================== 
            ACTIVE WARNINGS
            List from computePlantStatus
            ======================================== */}
        {activeWarnings.length > 0 && (
          <div
            className="p-3 rounded-xl"
            style={{
              background: `${BRAND.blue}15`,
              border: `1px solid ${BRAND.blue}30`,
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wide mb-2"
              style={{ color: `${BRAND.yellow}99` }}
            >
              Warnings ({activeWarnings.length})
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {activeWarnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[11px]"
                  style={{ color: `${BRAND.white}99` }}
                >
                  <span style={{ color: BRAND.yellow }}>•</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================== 
            MESSAGE FEED
            Live messages (success/warning/error)
            ======================================== */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: `${BRAND.indigo}60`,
            border: `1px solid ${BRAND.blue}20`,
          }}
        >
          <div
            className="px-3 py-2 flex items-center gap-2"
            style={{ borderBottom: `1px solid ${BRAND.blue}20` }}
          >
            <span className="text-[10px] font-semibold" style={{ color: `${BRAND.yellow}CC` }}>
              System Log
            </span>
          </div>
          <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {(!messages || messages.length === 0) ? (
                <p className="text-[10px] text-center py-3" style={{ color: `${BRAND.blue}60` }}>
                  Awaiting actions...
                </p>
              ) : (
                messages.slice(0, 8).map((msg) => (
                  <motion.div
                    key={msg.id}
                    className="flex items-start gap-2 p-2 rounded-lg text-[11px]"
                    style={{
                      background: getMessageBackground(msg.type),
                      color: getMessageColor(msg.type),
                    }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="font-bold">{getMessageIcon(msg.type)}</span>
                    <span>{msg.message}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ======================================== 
          RESET BUTTON
          Clears slots, placed items, messages
          ======================================== */}
      <div className="p-3" style={{ borderTop: `1px solid ${BRAND.blue}30` }}>
        <motion.button
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{
            background: `${BRAND.blue}30`,
            border: `1px solid ${BRAND.blue}50`,
            color: BRAND.white,
          }}
          whileHover={{
            background: `${BRAND.blue}50`,
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
        >
          Reset Plant
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================
// HELPER: Message background color
// ============================================
function getMessageBackground(type) {
  switch (type) {
    case "success":
      return `${BRAND.yellow}20`;
    case "error":
      return `${BRAND.indigo}90`;
    case "warning":
      return `${BRAND.yellow}15`;
    case "info":
    default:
      return `${BRAND.blue}25`;
  }
}

// ============================================
// HELPER: Message text color
// ============================================
function getMessageColor(type) {
  switch (type) {
    case "success":
      return BRAND.yellow;
    case "error":
      return `${BRAND.yellow}CC`;
    case "warning":
      return `${BRAND.yellow}DD`;
    case "info":
    default:
      return `${BRAND.white}99`;
  }
}

export default StatusPanel;
