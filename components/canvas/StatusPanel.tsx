"use client";

/**
 * StatusPanel - Right sidebar showing game status and system log
 * Displays validation messages, progress, and completion status
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo) - primary accents
 * - #2A6BB5 (blue) - backgrounds
 * - #FAE452 (yellow) - highlights
 */

import { motion, AnimatePresence } from "framer-motion";
import type { ValidationMessage } from "./types";

interface StatusPanelProps {
  /** Array of validation messages */
  messages: ValidationMessage[];
  /** Current progress percentage */
  progress: number;
  /** Whether the game is complete */
  isComplete: boolean;
}

export function StatusPanel({
  messages,
  progress,
  isComplete,
}: StatusPanelProps) {
  // Brand colors with opacity variations
  const brandIndigo = "#2E3093";
  const brandBlue = "#2A6BB5";
  const brandYellow = "#FAE452";

  return (
    <motion.div
      className="h-full flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: `${brandIndigo}CC`,
        border: `1px solid ${brandBlue}40`,
      }}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center gap-2"
        style={{
          borderBottom: `1px solid ${brandBlue}30`,
        }}
      >
        <span className="text-xl">📊</span>
        <span
          className="text-sm font-semibold"
          style={{ color: brandYellow }}
        >
          Status
        </span>
      </div>

      {/* Status cards */}
      <div className="p-3 space-y-3">
        {/* Progress card */}
        <div
          className="p-3 rounded-xl"
          style={{
            background: `${brandBlue}20`,
            border: `1px solid ${brandBlue}40`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: `${brandYellow}CC` }}
            >
              Progress
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: brandYellow }}
            >
              {progress}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: `${brandBlue}40` }}
          >
            <motion.div
              className="h-full"
              style={{ background: brandYellow }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Completion status card */}
        <div
          className="p-3 rounded-xl"
          style={{
            background: isComplete ? `${brandYellow}20` : `${brandBlue}20`,
            border: `1px solid ${isComplete ? brandYellow : `${brandBlue}40`}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{isComplete ? "✅" : "⏳"}</span>
            <div>
              <p
                className="text-xs font-medium"
                style={{ color: isComplete ? brandYellow : `${brandYellow}CC` }}
              >
                {isComplete ? "Complete!" : "In Progress"}
              </p>
              <p
                className="text-[10px]"
                style={{ color: `${brandBlue}80` }}
              >
                {isComplete ? "All components placed" : "Keep building..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System log */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            borderTop: `1px solid ${brandBlue}30`,
            borderBottom: `1px solid ${brandBlue}30`,
          }}
        >
          <span>📋</span>
          <span
            className="text-xs font-semibold"
            style={{ color: `${brandYellow}CC` }}
          >
            System Log
          </span>
        </div>

        {/* Messages list */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <p
                className="text-xs text-center py-4"
                style={{ color: `${brandBlue}60` }}
              >
                Awaiting actions...
              </p>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className="p-2 rounded-lg text-xs"
                  style={{
                    background: getMessageBackground(msg.type, brandIndigo, brandBlue, brandYellow),
                    color: getMessageColor(msg.type, brandYellow),
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {msg.message}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer with instructions */}
      <div
        className="p-3"
        style={{ borderTop: `1px solid ${brandBlue}30` }}
      >
        <p
          className="text-[10px] text-center"
          style={{ color: `${brandBlue}60` }}
        >
          Place components in sequence order
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Get background color based on message type using brand colors
 */
function getMessageBackground(
  type: ValidationMessage["type"],
  indigo: string,
  blue: string,
  yellow: string
): string {
  switch (type) {
    case "success":
      return `${yellow}20`;
    case "error":
      return `${indigo}80`;
    case "warning":
      return `${yellow}15`;
    case "info":
    default:
      return `${blue}30`;
  }
}

/**
 * Get text color based on message type using brand colors
 */
function getMessageColor(
  type: ValidationMessage["type"],
  yellow: string
): string {
  switch (type) {
    case "success":
      return yellow;
    case "error":
      return `${yellow}CC`;
    case "warning":
      return `${yellow}DD`;
    case "info":
    default:
      return `${yellow}99`;
  }
}
