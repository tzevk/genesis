"use client";

/**
 * PipeConnectingCanvas - Oil & Gas Flow Builder
 * 
 * Features:
 * - Click-to-connect pipe building
 * - SVG elbow pipe rendering
 * - Connection validation against correct flow
 * - Progressive hints after wrong attempts
 * 
 * Flow: Upstream → Midstream → Downstream
 * reservoir -> drilling -> platform -> pipeline -> separator -> storage_tank -> tanker
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Brand colors
const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
};

// Correct flow edges (directed graph)
const CORRECT_FLOW: Array<{ from: string; to: string }> = [
  { from: "reservoir", to: "drilling" },
  { from: "drilling", to: "platform" },
  { from: "platform", to: "pipeline" },
  { from: "pipeline", to: "separator" },
  { from: "separator", to: "storage_tank" },
  { from: "storage_tank", to: "tanker" },
];

// Progressive hints
const HINTS = [
  "Upstream collects oil offshore before transport.",
  "Separation happens onshore after the pipeline.",
  "Export to tanker happens after storage.",
];

// Node definitions with percent positions (0-100)
export interface FlowNode {
  id: string;
  label: string;
  stage: "upstream" | "midstream" | "downstream";
  x: number; // percent
  y: number; // percent
  icon: string;
}

const FLOW_NODES: FlowNode[] = [
  // Upstream (left side)
  { id: "reservoir", label: "Oil Reservoir", stage: "upstream", x: 8, y: 20, icon: "🛢️" },
  { id: "drilling", label: "Drilling Rig", stage: "upstream", x: 8, y: 50, icon: "⛽" },
  { id: "platform", label: "Floating Platform", stage: "upstream", x: 8, y: 80, icon: "🏗️" },
  // Midstream (center)
  { id: "pipeline", label: "Pipeline to Onshore", stage: "midstream", x: 50, y: 50, icon: "🔧" },
  // Downstream (right side)
  { id: "separator", label: "Oil & Water Separator", stage: "downstream", x: 92, y: 20, icon: "⚗️" },
  { id: "storage_tank", label: "Storage Tank", stage: "downstream", x: 92, y: 50, icon: "🏭" },
  { id: "tanker", label: "Tanker", stage: "downstream", x: 92, y: 80, icon: "🚢" },
];

// Connection type
interface Connection {
  fromId: string;
  toId: string;
}

// Toast message type
interface Toast {
  id: number;
  message: string;
  type: "error" | "success";
}

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  upstream: "#3B82F6",    // Blue
  midstream: "#F59E0B",   // Amber
  downstream: "#10B981",  // Green
};

export function PipeConnectingCanvas() {
  // State
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  // ResizeObserver to track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string, type: "error" | "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Check if connection is valid
  const isValidConnection = useCallback((fromId: string, toId: string): boolean => {
    return CORRECT_FLOW.some((edge) => edge.from === fromId && edge.to === toId);
  }, []);

  // Check if connection already exists
  const connectionExists = useCallback((fromId: string, toId: string): boolean => {
    return connections.some((c) => c.fromId === fromId && c.toId === toId);
  }, [connections]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    if (selectedNode === null) {
      // First click - select "from" node
      setSelectedNode(nodeId);
    } else if (selectedNode === nodeId) {
      // Clicked same node - deselect
      setSelectedNode(null);
    } else {
      // Second click - attempt connection
      const fromId = selectedNode;
      const toId = nodeId;

      // Check if connection already exists
      if (connectionExists(fromId, toId)) {
        showToast("Connection already exists!", "error");
        setSelectedNode(null);
        return;
      }

      // Validate connection
      if (isValidConnection(fromId, toId)) {
        // Valid connection - add it
        setConnections((prev) => [...prev, { fromId, toId }]);
        showToast("Connection established! ✓", "success");
      } else {
        // Invalid connection
        const newWrongAttempts = wrongAttempts + 1;
        setWrongAttempts(newWrongAttempts);
        showToast("Engineering check failed — invalid connection", "error");

        // Check if we need to show hint
        if (newWrongAttempts >= 3 && newWrongAttempts % 3 === 0) {
          const nextHintIndex = Math.min(Math.floor(newWrongAttempts / 3) - 1, HINTS.length - 1);
          setHintIndex(nextHintIndex);
          setShowHintModal(true);
        }
      }

      setSelectedNode(null);
    }
  }, [selectedNode, wrongAttempts, connectionExists, isValidConnection, showToast]);

  // Convert percent to pixels
  const percentToPixels = useCallback((xPercent: number, yPercent: number) => {
    return {
      x: (xPercent / 100) * containerSize.width,
      y: (yPercent / 100) * containerSize.height,
    };
  }, [containerSize]);

  // Generate SVG elbow path between two points
  const generateElbowPath = useCallback((
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): string => {
    const nodeWidth = 140;
    const nodeHeight = 70;
    
    // Adjust for node center/edge
    const startX = fromX + nodeWidth / 2;
    const startY = fromY + nodeHeight / 2;
    const endX = toX + nodeWidth / 2;
    const endY = toY + nodeHeight / 2;

    // Calculate control points for smooth elbow
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Determine if horizontal or vertical first
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    
    if (dx > dy) {
      // Horizontal-first elbow
      const cp1x = midX;
      const cp1y = startY;
      const cp2x = midX;
      const cp2y = endY;
      
      // Smooth curve with bezier
      return `M ${startX} ${startY} 
              C ${cp1x} ${cp1y}, ${cp1x} ${cp1y}, ${midX} ${midY}
              C ${cp2x} ${cp2y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
    } else {
      // Vertical-first elbow
      const cp1x = startX;
      const cp1y = midY;
      const cp2x = endX;
      const cp2y = midY;
      
      return `M ${startX} ${startY} 
              C ${cp1x} ${cp1y}, ${cp1x} ${cp1y}, ${midX} ${midY}
              C ${cp2x} ${cp2y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
    }
  }, []);

  // Reset all connections
  const handleReset = useCallback(() => {
    setConnections([]);
    setSelectedNode(null);
    setWrongAttempts(0);
  }, []);

  // Check if all connections are complete
  const isComplete = connections.length === CORRECT_FLOW.length;

  // Get node by ID
  const getNodeById = (id: string) => FLOW_NODES.find((n) => n.id === id);

  return (
    <div className="relative w-full h-full min-h-[600px]" style={{ background: BRAND.indigo }}>
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ minHeight: "600px" }}
      >
        {/* SVG Overlay for pipes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <defs>
            {/* Glow filter for pipes */}
            <filter id="pipeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={BRAND.yellow}
              />
            </marker>
          </defs>

          {/* Draw connections */}
          {connections.map((conn, index) => {
            const fromNode = getNodeById(conn.fromId);
            const toNode = getNodeById(conn.toId);
            if (!fromNode || !toNode) return null;

            const fromPos = percentToPixels(fromNode.x, fromNode.y);
            const toPos = percentToPixels(toNode.x, toNode.y);
            const path = generateElbowPath(fromPos.x, fromPos.y, toPos.x, toPos.y);

            return (
              <motion.path
                key={`${conn.fromId}-${conn.toId}`}
                d={path}
                fill="none"
                stroke={BRAND.yellow}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#pipeGlow)"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              />
            );
          })}

          {/* Draw preview line when selecting */}
          {selectedNode && containerSize.width > 0 && (
            <motion.circle
              cx={percentToPixels(getNodeById(selectedNode)!.x, getNodeById(selectedNode)!.y).x + 70}
              cy={percentToPixels(getNodeById(selectedNode)!.x, getNodeById(selectedNode)!.y).y + 35}
              r="8"
              fill={BRAND.yellow}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </svg>

        {/* Stage Labels */}
        <div className="absolute top-4 left-0 right-0 flex justify-around pointer-events-none" style={{ zIndex: 10 }}>
          {["upstream", "midstream", "downstream"].map((stage) => (
            <div
              key={stage}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: `${STAGE_COLORS[stage]}30`,
                color: STAGE_COLORS[stage],
                border: `1px solid ${STAGE_COLORS[stage]}50`,
              }}
            >
              {stage === "upstream" && "🔵 Upstream"}
              {stage === "midstream" && "🟡 Midstream"}
              {stage === "downstream" && "🟢 Downstream"}
            </div>
          ))}
        </div>

        {/* Flow Nodes */}
        {FLOW_NODES.map((node) => {
          const isSelected = selectedNode === node.id;
          const hasOutgoingConnection = connections.some((c) => c.fromId === node.id);
          const hasIncomingConnection = connections.some((c) => c.toId === node.id);
          const isConnected = hasOutgoingConnection || hasIncomingConnection;

          return (
            <motion.div
              key={node.id}
              className="absolute cursor-pointer select-none"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isSelected ? 20 : 10,
              }}
              onClick={() => handleNodeClick(node.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="px-4 py-3 rounded-2xl backdrop-blur-md transition-all duration-200"
                style={{
                  background: isSelected
                    ? `${BRAND.yellow}20`
                    : `${BRAND.blue}60`,
                  border: isSelected
                    ? `3px solid ${BRAND.yellow}`
                    : isConnected
                    ? `2px solid ${BRAND.yellow}80`
                    : `2px solid ${BRAND.blue}80`,
                  boxShadow: isSelected
                    ? `0 0 30px ${BRAND.yellow}60, 0 8px 32px rgba(0,0,0,0.3)`
                    : `0 8px 32px rgba(0,0,0,0.2)`,
                  minWidth: "140px",
                }}
              >
                {/* Stage indicator */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{
                    background: STAGE_COLORS[node.stage],
                    color: BRAND.white,
                  }}
                >
                  {node.stage}
                </div>

                {/* Node content */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{node.icon}</span>
                  <div>
                    <p
                      className="text-xs font-bold leading-tight"
                      style={{ color: BRAND.white }}
                    >
                      {node.label}
                    </p>
                    {isConnected && (
                      <p className="text-[10px]" style={{ color: BRAND.yellow }}>
                        ✓ Connected
                      </p>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: BRAND.yellow, color: BRAND.indigo }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Click target →
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Status Panel */}
        <div
          className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-md"
          style={{
            background: `${BRAND.blue}40`,
            border: `1px solid ${BRAND.blue}60`,
            zIndex: 30,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Progress */}
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: `${BRAND.white}60` }}>
                  Connections
                </p>
                <p className="text-lg font-bold" style={{ color: BRAND.white }}>
                  {connections.length} / {CORRECT_FLOW.length}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-40">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: `${BRAND.blue}50` }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: BRAND.yellow }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(connections.length / CORRECT_FLOW.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Wrong attempts */}
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: `${BRAND.white}60` }}>
                  Attempts
                </p>
                <p className="text-lg font-bold" style={{ color: wrongAttempts > 0 ? "#EF4444" : BRAND.white }}>
                  {wrongAttempts} wrong
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: `${BRAND.blue}50`,
                  color: BRAND.white,
                  border: `1px solid ${BRAND.blue}80`,
                }}
              >
                Reset
              </button>

              {isComplete && (
                <motion.div
                  className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: BRAND.yellow, color: BRAND.indigo }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓ Complete!
                </motion.div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <p className="mt-2 text-xs" style={{ color: `${BRAND.white}70` }}>
            {selectedNode
              ? `Selected: ${getNodeById(selectedNode)?.label} — Click another node to connect`
              : "Click a node to start connecting. Build the flow: Reservoir → Drilling → Platform → Pipeline → Separator → Storage → Tanker"}
          </p>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-2" style={{ zIndex: 100 }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="px-4 py-3 rounded-xl backdrop-blur-md shadow-lg"
              style={{
                background: toast.type === "error" ? "rgba(239, 68, 68, 0.9)" : "rgba(34, 197, 94, 0.9)",
                color: BRAND.white,
              }}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
            >
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 200, background: "rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              className="max-w-md mx-4 p-6 rounded-3xl"
              style={{
                background: BRAND.white,
                boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
              }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${BRAND.yellow}20` }}
                >
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: BRAND.indigo }}>
                    Engineering Hint
                  </h3>
                  <p className="text-xs" style={{ color: `${BRAND.indigo}60` }}>
                    Hint {hintIndex + 1} of {HINTS.length}
                  </p>
                </div>
              </div>

              {/* Hint content */}
              <div
                className="p-4 rounded-2xl mb-4"
                style={{ background: `${BRAND.blue}10` }}
              >
                <p className="text-sm leading-relaxed" style={{ color: BRAND.indigo }}>
                  {HINTS[hintIndex]}
                </p>
              </div>

              {/* Flow reminder */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: `${BRAND.indigo}60` }}>
                  Correct Flow Order
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Reservoir", "Drilling", "Platform", "Pipeline", "Separator", "Storage", "Tanker"].map((name, i) => (
                    <span key={name} className="flex items-center">
                      <span
                        className="px-2 py-1 rounded-lg text-[10px] font-medium"
                        style={{ background: `${BRAND.indigo}10`, color: BRAND.indigo }}
                      >
                        {name}
                      </span>
                      {i < 6 && (
                        <span className="mx-1 text-xs" style={{ color: BRAND.yellow }}>→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowHintModal(false)}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: BRAND.yellow,
                  color: BRAND.indigo,
                }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
