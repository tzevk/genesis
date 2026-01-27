"use client";

/**
 * OilGasPipeCanvas - Specialized Canvas for Oil & Gas Sector
 * 
 * Features:
 * - Click-to-connect pipe building
 * - SVG elbow pipe rendering
 * - Connection validation against correct flow
 * - Progressive hints after wrong attempts
 * - Integrated with main canvas layout
 * 
 * Flow: Upstream → Midstream → Downstream
 * reservoir -> drilling -> platform -> pipeline -> separator -> storage_tank -> tanker
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "@/components/canvas/Timer";

// Brand colors
const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
};

// Timer duration (3 minutes)
const TIMER_DURATION = 180;

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
  "Hint: Upstream collects oil offshore before transport.",
  "Hint: Separation happens onshore after the pipeline.",
  "Hint: Export to tanker happens after storage.",
];

// Node definitions with percent positions (0-100)
export interface FlowNode {
  id: string;
  label: string;
  stage: "upstream" | "midstream" | "downstream";
  x: number; // percent
  y: number; // percent
  icon: string;
  description: string;
}

const FLOW_NODES: FlowNode[] = [
  // Upstream (left side - offshore)
  { id: "reservoir", label: "Oil Reservoir", stage: "upstream", x: 12, y: 25, icon: "🛢️", description: "Underground crude oil source" },
  { id: "drilling", label: "Drilling Rig", stage: "upstream", x: 12, y: 50, icon: "⛽", description: "Extracts oil from reservoir" },
  { id: "platform", label: "Floating Platform", stage: "upstream", x: 12, y: 75, icon: "🏗️", description: "Offshore production platform" },
  // Midstream (center - transport)
  { id: "pipeline", label: "Pipeline to Onshore", stage: "midstream", x: 50, y: 50, icon: "🔧", description: "Subsea transport to land" },
  // Downstream (right side - onshore processing)
  { id: "separator", label: "Oil & Water Separator", stage: "downstream", x: 88, y: 25, icon: "⚗️", description: "Separates crude from water" },
  { id: "storage_tank", label: "Storage Tank", stage: "downstream", x: 88, y: 50, icon: "🏭", description: "Stores processed crude" },
  { id: "tanker", label: "Tanker", stage: "downstream", x: 88, y: 75, icon: "🚢", description: "Export ship for distribution" },
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
  type: "error" | "success" | "info";
}

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  upstream: "#3B82F6",    // Blue
  midstream: "#F59E0B",   // Amber
  downstream: "#10B981",  // Green
};

interface OilGasPipeCanvasProps {
  userName: string;
  onComplete: (score: number, connections: Connection[], timeLeft: number) => void;
  onExit: () => void;
}

export function OilGasPipeCanvas({ userName, onComplete, onExit }: OilGasPipeCanvasProps) {
  // State
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);
  const hasCompletedRef = useRef(false);

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

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          // Time's up - submit with current progress
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            const score = calculateScore(connections, 0, wrongAttempts);
            onComplete(score, connections, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, connections, wrongAttempts, onComplete]);

  // Check for completion
  useEffect(() => {
    if (connections.length === CORRECT_FLOW.length && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setIsComplete(true);
      setTimerActive(false);
      
      // Calculate score and call onComplete
      const score = calculateScore(connections, timeLeft, wrongAttempts);
      setTimeout(() => {
        onComplete(score, connections, timeLeft);
      }, 2000);
    }
  }, [connections, timeLeft, wrongAttempts, onComplete]);

  // Calculate score
  const calculateScore = (conns: Connection[], time: number, wrong: number): number => {
    const baseScore = conns.length * 100; // 100 points per correct connection
    const timeBonus = Math.floor(time * 2); // 2 points per second remaining
    const wrongPenalty = wrong * 10; // -10 points per wrong attempt
    return Math.max(0, baseScore + timeBonus - wrongPenalty);
  };

  // Show toast notification
  const showToast = useCallback((message: string, type: Toast["type"]) => {
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

  // Get next expected connection hint
  const getNextExpectedConnection = useCallback((): string | null => {
    for (const edge of CORRECT_FLOW) {
      if (!connections.some((c) => c.fromId === edge.from && c.toId === edge.to)) {
        const fromNode = FLOW_NODES.find(n => n.id === edge.from);
        const toNode = FLOW_NODES.find(n => n.id === edge.to);
        if (fromNode && toNode) {
          return `${fromNode.label} → ${toNode.label}`;
        }
      }
    }
    return null;
  }, [connections]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    if (isComplete) return;

    if (selectedNode === null) {
      // First click - select "from" node
      setSelectedNode(nodeId);
      showToast(`Selected: ${FLOW_NODES.find(n => n.id === nodeId)?.label}`, "info");
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
        showToast("✓ Connection established!", "success");
      } else {
        // Invalid connection
        const newWrongAttempts = wrongAttempts + 1;
        setWrongAttempts(newWrongAttempts);
        showToast("✗ Engineering check failed — invalid flow", "error");

        // Check if we need to show hint
        if (newWrongAttempts >= 3 && newWrongAttempts % 3 === 0) {
          const nextHintIndex = Math.min(Math.floor(newWrongAttempts / 3) - 1, HINTS.length - 1);
          setHintIndex(nextHintIndex);
          setTimeout(() => setShowHintModal(true), 500);
        }
      }

      setSelectedNode(null);
    }
  }, [selectedNode, wrongAttempts, isComplete, connectionExists, isValidConnection, showToast]);

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
    const nodeWidth = 160;
    const nodeHeight = 80;
    
    // Adjust for node center
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
    
    if (dx > dy * 0.5) {
      // Horizontal-dominant elbow
      return `M ${startX} ${startY} 
              C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    } else {
      // Vertical-dominant elbow
      return `M ${startX} ${startY} 
              C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
    }
  }, []);

  // Reset all connections
  const handleReset = useCallback(() => {
    setConnections([]);
    setSelectedNode(null);
    setWrongAttempts(0);
    showToast("Canvas reset", "info");
  }, [showToast]);

  // Get node by ID
  const getNodeById = (id: string) => FLOW_NODES.find((n) => n.id === id);

  // Calculate progress
  const progress = Math.round((connections.length / CORRECT_FLOW.length) * 100);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: BRAND.indigo }}>
      {/* Background grid */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(${BRAND.blue}15 1px, transparent 1px), linear-gradient(90deg, ${BRAND.blue}15 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Layout */}
      <div className="relative z-10 h-screen p-4 flex gap-4">
        
        {/* LEFT PANEL: Task Info */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          
          {/* Task Panel */}
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
              background: `${BRAND.indigo}E0`,
              border: `1px solid ${BRAND.blue}40`,
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Header with Timer */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${BRAND.blue}30` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${BRAND.yellow}20` }}
                >
                  <span className="text-lg">🛢️</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: BRAND.white }}>Oil & Gas Flow</h2>
                  <p className="text-[10px]" style={{ color: `${BRAND.white}60` }}>{userName}</p>
                </div>
              </div>
              <Timer timeLeft={timeLeft} totalTime={TIMER_DURATION} />
            </div>

            {/* Task Content */}
            <div className="p-4 space-y-3">
              <h3 className="text-base font-bold" style={{ color: BRAND.yellow }}>
                Connect the Flow
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: `${BRAND.white}90` }}>
                Build the oil production pipeline by connecting components in the correct sequence: Upstream → Midstream → Downstream.
              </p>
              
              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: `${BRAND.white}50` }}>
                  How to Connect
                </p>
                <ul className="space-y-1 text-[11px]" style={{ color: `${BRAND.white}70` }}>
                  <li>1. Click a component to select it</li>
                  <li>2. Click another component to connect</li>
                  <li>3. Only valid connections are allowed</li>
                </ul>
              </div>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: `${BRAND.white}60` }}>Progress</span>
                  <span className="text-[10px] font-bold" style={{ color: BRAND.yellow }}>{progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${BRAND.blue}30` }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: BRAND.yellow }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2">
                <div>
                  <p className="text-[10px]" style={{ color: `${BRAND.white}50` }}>Connections</p>
                  <p className="text-lg font-bold" style={{ color: BRAND.white }}>
                    {connections.length}/{CORRECT_FLOW.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: `${BRAND.white}50` }}>Wrong</p>
                  <p className="text-lg font-bold" style={{ color: wrongAttempts > 0 ? "#EF4444" : BRAND.white }}>
                    {wrongAttempts}
                  </p>
                </div>
              </div>

              {/* Next expected hint */}
              {!isComplete && getNextExpectedConnection() && (
                <div
                  className="p-2 rounded-lg text-[10px]"
                  style={{ background: `${BRAND.blue}30`, color: `${BRAND.white}80` }}
                >
                  💡 Next: {getNextExpectedConnection()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{ background: `${BRAND.blue}30`, color: BRAND.white, border: `1px solid ${BRAND.blue}50` }}
                >
                  Reset
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{ background: BRAND.yellow, color: BRAND.indigo }}
                >
                  {isComplete ? "Continue" : "Submit"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Flow Legend */}
          <motion.div
            className="rounded-2xl p-4"
            style={{
              background: `${BRAND.indigo}E0`,
              border: `1px solid ${BRAND.blue}40`,
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xs font-bold mb-3" style={{ color: BRAND.white }}>
              Correct Flow Order
            </h4>
            <div className="space-y-1">
              {FLOW_NODES.map((node, i) => {
                const isConnected = connections.some(c => c.fromId === node.id || c.toId === node.id);
                return (
                  <div key={node.id} className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                      style={{
                        background: isConnected ? BRAND.yellow : STAGE_COLORS[node.stage],
                        color: isConnected ? BRAND.indigo : BRAND.white,
                      }}
                    >
                      {isConnected ? "✓" : i + 1}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: isConnected ? BRAND.yellow : `${BRAND.white}80` }}
                    >
                      {node.label}
                    </span>
                    {i < FLOW_NODES.length - 1 && (
                      <span className="text-[10px] ml-auto" style={{ color: `${BRAND.white}40` }}>→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Canvas Area */}
        <div className="flex-1 relative">
          <motion.div
            ref={containerRef}
            className="w-full h-full rounded-2xl relative overflow-hidden"
            style={{
              background: `${BRAND.blue}20`,
              border: `1px solid ${BRAND.blue}40`,
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Stage Labels */}
            <div className="absolute top-4 left-0 right-0 flex justify-around pointer-events-none z-20">
              {["upstream", "midstream", "downstream"].map((stage) => (
                <div
                  key={stage}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: `${STAGE_COLORS[stage]}20`,
                    color: STAGE_COLORS[stage],
                    border: `1px solid ${STAGE_COLORS[stage]}40`,
                  }}
                >
                  {stage === "upstream" && "🔵 Upstream (Offshore)"}
                  {stage === "midstream" && "🟡 Midstream (Transport)"}
                  {stage === "downstream" && "🟢 Downstream (Onshore)"}
                </div>
              ))}
            </div>

            {/* SVG Overlay for pipes */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <defs>
                {/* Glow filter for pipes */}
                <filter id="pipeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                {/* Animated dash pattern */}
                <pattern id="flowPattern" patternUnits="userSpaceOnUse" width="20" height="4">
                  <rect x="0" y="0" width="10" height="4" fill={BRAND.yellow} />
                </pattern>
                
                {/* Arrow marker */}
                <marker
                  id="arrowhead"
                  markerWidth="12"
                  markerHeight="8"
                  refX="10"
                  refY="4"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 12 4, 0 8"
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
                  <g key={`${conn.fromId}-${conn.toId}`}>
                    {/* Glow background */}
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={`${BRAND.yellow}40`}
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                    {/* Main pipe */}
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={BRAND.yellow}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#arrowhead)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    />
                  </g>
                );
              })}
            </svg>

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
                    zIndex: isSelected ? 30 : 15,
                  }}
                  onClick={() => handleNodeClick(node.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: FLOW_NODES.indexOf(node) * 0.05 }}
                >
                  <div
                    className="px-4 py-3 rounded-2xl backdrop-blur-md transition-all duration-200"
                    style={{
                      background: isSelected
                        ? `${BRAND.yellow}25`
                        : isConnected
                        ? `${BRAND.indigo}90`
                        : `${BRAND.blue}70`,
                      border: isSelected
                        ? `3px solid ${BRAND.yellow}`
                        : isConnected
                        ? `2px solid ${BRAND.yellow}`
                        : `2px solid ${BRAND.blue}80`,
                      boxShadow: isSelected
                        ? `0 0 40px ${BRAND.yellow}60, 0 8px 32px rgba(0,0,0,0.4)`
                        : isConnected
                        ? `0 0 20px ${BRAND.yellow}30, 0 8px 32px rgba(0,0,0,0.3)`
                        : `0 8px 32px rgba(0,0,0,0.2)`,
                      minWidth: "160px",
                    }}
                  >
                    {/* Stage indicator */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      style={{
                        background: STAGE_COLORS[node.stage],
                        color: BRAND.white,
                      }}
                    >
                      {node.stage}
                    </div>

                    {/* Node content */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{node.icon}</span>
                      <div>
                        <p
                          className="text-sm font-bold leading-tight"
                          style={{ color: BRAND.white }}
                        >
                          {node.label}
                        </p>
                        <p
                          className="text-[10px] leading-tight mt-0.5"
                          style={{ color: `${BRAND.white}70` }}
                        >
                          {node.description}
                        </p>
                        {isConnected && (
                          <p className="text-[10px] mt-1" style={{ color: BRAND.yellow }}>
                            ✓ Connected
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                        style={{ background: BRAND.yellow, color: BRAND.indigo }}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        Click target to connect →
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Completion overlay */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  style={{ background: `${BRAND.indigo}90` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="text-center p-8 rounded-3xl"
                    style={{ background: BRAND.white }}
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.indigo }}>
                      Flow Complete!
                    </h2>
                    <p className="text-sm mb-4" style={{ color: `${BRAND.indigo}80` }}>
                      You've successfully built the oil production pipeline.
                    </p>
                    <div className="flex justify-center gap-6 mb-4">
                      <div>
                        <p className="text-3xl font-bold" style={{ color: BRAND.yellow }}>
                          {calculateScore(connections, timeLeft, wrongAttempts)}
                        </p>
                        <p className="text-xs" style={{ color: `${BRAND.indigo}60` }}>Points</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold" style={{ color: BRAND.blue }}>
                          {timeLeft}s
                        </p>
                        <p className="text-xs" style={{ color: `${BRAND.indigo}60` }}>Time Left</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-2" style={{ zIndex: 100 }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="px-4 py-3 rounded-xl backdrop-blur-md shadow-lg min-w-[200px]"
              style={{
                background: toast.type === "error" 
                  ? "rgba(239, 68, 68, 0.95)" 
                  : toast.type === "success"
                  ? "rgba(34, 197, 94, 0.95)"
                  : "rgba(59, 130, 246, 0.95)",
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
            style={{ zIndex: 200, background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              className="max-w-md mx-4 p-6 rounded-3xl"
              style={{
                background: BRAND.white,
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${BRAND.yellow}20` }}
                >
                  <span className="text-3xl">💡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: BRAND.indigo }}>
                    Engineering Hint
                  </h3>
                  <p className="text-sm" style={{ color: `${BRAND.indigo}60` }}>
                    Hint {hintIndex + 1} of {HINTS.length}
                  </p>
                </div>
              </div>

              {/* Hint content */}
              <div
                className="p-4 rounded-2xl mb-4"
                style={{ background: `${BRAND.blue}10` }}
              >
                <p className="text-base leading-relaxed" style={{ color: BRAND.indigo }}>
                  {HINTS[hintIndex]}
                </p>
              </div>

              {/* Flow reminder */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: `${BRAND.indigo}60` }}>
                  Remember the Flow
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  {["Reservoir", "→", "Drilling", "→", "Platform", "→", "Pipeline", "→", "Separator", "→", "Storage", "→", "Tanker"].map((item, i) => (
                    <span
                      key={i}
                      className={item === "→" ? "text-sm" : "px-2 py-1 rounded-lg text-xs font-medium"}
                      style={{
                        background: item === "→" ? "transparent" : `${BRAND.indigo}10`,
                        color: item === "→" ? BRAND.yellow : BRAND.indigo,
                      }}
                    >
                      {item}
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
                Got it, let me try again!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
