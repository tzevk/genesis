"use client";

/**
 * SystemLog - Displays validation messages and system feedback
 * Shows recent actions with color-coded status
 */

import { motion, AnimatePresence } from "framer-motion";
import type { ValidationMessage } from "./types";

interface SystemLogProps {
  /** Array of validation messages to display */
  messages: ValidationMessage[];
}

/**
 * Get background and text color based on message type
 */
function getMessageColors(type: ValidationMessage["type"]) {
  switch (type) {
    case "success":
      return { bg: "rgba(16, 185, 129, 0.2)", color: "#10B981" };
    case "error":
      return { bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444" };
    case "warning":
      return { bg: "rgba(245, 158, 11, 0.2)", color: "#F59E0B" };
    case "info":
    default:
      return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6" };
  }
}

export function SystemLog({ messages }: SystemLogProps) {
  return (
    <motion.div 
      className="mt-3 rounded-xl p-3"
      style={{
        background: "rgba(20, 20, 40, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span>📋</span>
        <span className="text-xs font-semibold text-white/70">System Log</span>
      </div>
      
      {/* Message list - horizontal scrolling */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            // Empty state
            <div className="text-xs text-white/30 py-1">
              Awaiting component placement...
            </div>
          ) : (
            // Show up to 4 most recent messages
            messages.slice(0, 4).map((msg) => {
              const colors = getMessageColors(msg.type);
              
              return (
                <motion.div
                  key={msg.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: colors.bg,
                    color: colors.color,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {msg.message}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
