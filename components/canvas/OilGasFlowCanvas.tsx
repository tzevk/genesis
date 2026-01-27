"use client";

/**
 * OilGasFlowCanvas - Drag & Drop with Auto-Connecting Pipes
 * 
 * Features:
 * - Drag components from toolbox to canvas
 * - Auto-connect pipes when placed in correct sequence
 * - Visual flow: Upstream → Midstream → Downstream
 * - Progressive hints after 3 wrong placements
 * - Ocean-themed SVG background
 * - All icons are SVG (no emojis)
 * 
 * Correct Flow Order:
 * Oil Reservoir → Drilling Rig → Floating Platform → Pipeline → Separator → Storage Tank → Tanker
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

// SVG Icons for Oil & Gas components
const ICONS = {
  reservoir: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <ellipse cx="12" cy="18" rx="9" ry="4" fill="#1e3a5f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 18V12c0-2 4-4 9-4s9 2 9 4v6" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="12" cy="8" rx="9" ry="4" fill="#2d4a6f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 8v10M12 8v10M16 8v10" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  ),
  drilling: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 2L10 6h4l-2-4z" fill="currentColor"/>
      <rect x="11" y="6" width="2" height="12" fill="currentColor"/>
      <path d="M8 10h8M8 14h8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 18h12v2H6v-2z" fill="currentColor"/>
      <path d="M11 18v4h2v-4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="22" r="1" fill="currentColor"/>
    </svg>
  ),
  platform: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <rect x="6" y="8" width="12" height="8" rx="1" fill="#2d4a6f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 16l-2 6M16 16l2 6M12 16v6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 4l2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="11" y="4" width="2" height="4" fill="currentColor"/>
      <circle cx="5" cy="22" r="1" fill="currentColor"/>
      <circle cx="19" cy="22" r="1" fill="currentColor"/>
      <circle cx="12" cy="22" r="1" fill="currentColor"/>
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M2 12h6M16 12h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <rect x="8" y="8" width="8" height="8" rx="2" fill="#2d4a6f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 12h4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="4" cy="12" r="2" fill="currentColor" opacity="0.5"/>
      <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  separator: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <rect x="4" y="6" width="16" height="12" rx="2" fill="#2d4a6f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <circle cx="8" cy="9" r="1.5" fill="#3b82f6"/>
      <circle cx="12" cy="9" r="1.5" fill="#3b82f6"/>
      <circle cx="8" cy="15" r="1.5" fill="#fbbf24"/>
      <circle cx="12" cy="15" r="1.5" fill="#fbbf24"/>
      <path d="M16 6v-2M16 20v-2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  storage: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#2d4a6f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 8h16M4 12h16M4 16h16" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <rect x="8" y="6" width="8" height="4" rx="1" fill="currentColor" opacity="0.3"/>
      <path d="M12 2v2M12 20v2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  tanker: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M2 16c0 0 2 4 10 4s10-4 10-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 16v-4c0-1 1-2 2-2h12c1 0 2 1 2 2v4" fill="#2d4a6f" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="6" y="12" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
      <rect x="11" y="12" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
      <path d="M18 10l2-3h-3l1 3" fill="currentColor"/>
      <path d="M2 18h20" stroke="#3b82f6" strokeWidth="2" opacity="0.3"/>
    </svg>
  ),
  oil: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 2c-4 6-8 10-8 14a8 8 0 1016 0c0-4-4-8-8-14z" fill="#1e3a5f" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6c-2 4-4 6-4 9a4 4 0 108 0c0-3-2-5-4-9z" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  hint: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 4h10v5c0 3-2 5-5 5s-5-2-5-5V4z" fill="#fbbf24" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 6H4c0 3 1 4 3 5M17 6h3c0 3-1 4-3 5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  drop: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 22c4 0 7-3 7-7 0-5-7-13-7-13S5 10 5 15c0 4 3 7 7 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18c2 0 3.5-1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// Timer duration (2 minutes 30 seconds)
const TIMER_DURATION = 150;

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  upstream: "#3B82F6",
  midstream: "#F59E0B",
  downstream: "#10B981",
};

// Component definitions - order matters!
interface FlowComponent {
  id: string;
  label: string;
  stage: "upstream" | "midstream" | "downstream";
  icon: string;
  description: string;
  order: number;
}

const FLOW_COMPONENTS: FlowComponent[] = [
  { id: "reservoir", label: "Oil Reservoir", stage: "upstream", icon: "reservoir", description: "Underground crude oil source", order: 0 },
  { id: "drilling", label: "Drilling Rig", stage: "upstream", icon: "drilling", description: "Extracts oil from reservoir", order: 1 },
  { id: "platform", label: "Floating Platform", stage: "upstream", icon: "platform", description: "Offshore production platform", order: 2 },
  { id: "pipeline", label: "Pipeline to Onshore", stage: "midstream", icon: "pipeline", description: "Subsea transport to land", order: 3 },
  { id: "separator", label: "Oil & Water Separator", stage: "downstream", icon: "separator", description: "Separates crude from water", order: 4 },
  { id: "storage_tank", label: "Storage Tank", stage: "downstream", icon: "storage", description: "Stores processed crude", order: 5 },
  { id: "tanker", label: "Tanker", stage: "downstream", icon: "tanker", description: "Export ship for distribution", order: 6 },
];

// Suggestive hints (shown after 3 wrong attempts - don't reveal exact answer)
const HINTS = [
  "Think about where oil comes from naturally - what's the very first step in extraction?",
  "Consider the journey: underground source, extraction equipment, collection point, transport, processing, storage, shipping.",
  "Offshore operations happen first, then the oil travels to land for processing and export.",
];

// Placed component on canvas
interface PlacedComponent {
  id: string;
  componentId: string;
  x: number;
  y: number;
}

// Pipe connection
interface PipeConnection {
  fromId: string;
  toId: string;
}

// Toast
interface Toast {
  id: number;
  message: string;
  type: "error" | "success" | "info";
}

interface OilGasFlowCanvasProps {
  userName: string;
  onComplete: (score: number, timeLeft: number) => void;
  onExit: () => void;
  isActive?: boolean; // Controls when timer starts (after tutorial)
}

// Shuffle array helper (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function OilGasFlowCanvas({ userName, onComplete, onExit, isActive = true }: OilGasFlowCanvasProps) {
  // Randomized components order (computed once on mount)
  const [shuffledComponents] = useState(() => shuffleArray(FLOW_COMPONENTS));
  
  // State
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [connections, setConnections] = useState<PipeConnection[]>([]);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false); // Start paused, controlled by isActive prop
  const [isComplete, setIsComplete] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);
  const hasCompletedRef = useRef(false);

  // ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate score
  const calculateScore = useCallback(() => {
    const baseScore = connections.length * 100;
    const timeBonus = Math.floor(timeLeft * 2);
    const wrongPenalty = wrongAttempts * 10;
    return Math.max(0, baseScore + timeBonus - wrongPenalty);
  }, [connections.length, timeLeft, wrongAttempts]);

  // Start timer when isActive becomes true (after tutorial ends)
  useEffect(() => {
    if (isActive && !timerActive && timeLeft === TIMER_DURATION) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimerActive(true);
    }
  }, [isActive, timerActive, timeLeft]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            const score = calculateScore();
            onComplete(score, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, onComplete, calculateScore]);

  // Check completion
  useEffect(() => {
    if (placedComponents.length === FLOW_COMPONENTS.length && connections.length === FLOW_COMPONENTS.length - 1) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        const score = calculateScore();
        setTimeout(() => {
          setIsComplete(true);
          setTimerActive(false);
          onComplete(score, timeLeft);
        }, 2500);
      }
    }
  }, [placedComponents, connections, timeLeft, onComplete, calculateScore]);

  // Show toast
  const showToast = useCallback((message: string, type: Toast["type"]) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // Get next expected component
  const getNextExpectedComponent = useCallback((): FlowComponent | null => {
    const placedIds = placedComponents.map((p) => p.componentId);
    for (const comp of FLOW_COMPONENTS) {
      if (!placedIds.includes(comp.id)) {
        return comp;
      }
    }
    return null;
  }, [placedComponents]);

  // Check if component can be placed (is it the next in sequence?)
  const isCorrectNextComponent = useCallback((componentId: string): boolean => {
    const nextExpected = getNextExpectedComponent();
    return nextExpected?.id === componentId;
  }, [getNextExpectedComponent]);

  // Get last placed component
  const getLastPlacedComponent = useCallback((): PlacedComponent | null => {
    if (placedComponents.length === 0) return null;
    return placedComponents[placedComponents.length - 1];
  }, [placedComponents]);

  // Handle drag start from toolbox
  const handleDragStart = useCallback((componentId: string) => {
    setDraggedComponent(componentId);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedComponent(null);
  }, []);

  // Handle drop on canvas
  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const componentId = e.dataTransfer.getData("componentId");
    if (!componentId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 80;
    const y = e.clientY - rect.top - 40;

    // Check if already placed
    if (placedComponents.some((p) => p.componentId === componentId)) {
      showToast("Component already placed!", "error");
      return;
    }

    // Check if correct sequence
    if (!isCorrectNextComponent(componentId)) {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      // Only show contextual hints after 3 wrong attempts
      let errorMessage = "That's not the right component. Try again!";
      
      if (newWrongAttempts >= 3) {
        // Get contextual error message based on specific rule violations
        const placedIds = placedComponents.map((p) => p.componentId);
        
        // Rule A & B: Separator placed before pipeline (offshore constraint / transport before processing)
        if (componentId === "separator" && !placedIds.includes("pipeline")) {
          errorMessage = "Separation systems are land-based due to space and safety constraints.";
        }
        // Alternative check for Rule B: Any processing before transport
        else if ((componentId === "separator" || componentId === "storage_tank" || componentId === "tanker") && !placedIds.includes("pipeline")) {
          errorMessage = "Processing cannot occur before transportation to onshore facilities.";
        }
        // Rule C: Tanker before storage
        else if (componentId === "tanker" && !placedIds.includes("storage_tank")) {
          errorMessage = "Export logistics require tank farm storage first.";
        }
        // Storage before separator
        else if (componentId === "storage_tank" && !placedIds.includes("separator")) {
          errorMessage = "Crude must be separated from water before storage.";
        }
        // Platform before drilling
        else if (componentId === "platform" && !placedIds.includes("drilling")) {
          errorMessage = "Drilling equipment must be set up before the collection platform.";
        }
        // Drilling before reservoir
        else if (componentId === "drilling" && !placedIds.includes("reservoir")) {
          errorMessage = "You need to identify the oil source before extraction.";
        }
      }
      
      showToast(errorMessage, "error");

      // Show hint modal after 3 wrong attempts (and every 3rd attempt after)
      if (newWrongAttempts >= 3 && newWrongAttempts % 3 === 0) {
        const nextHint = Math.min(Math.floor(newWrongAttempts / 3) - 1, HINTS.length - 1);
        setHintIndex(nextHint);
        setTimeout(() => setShowHintModal(true), 500);
      }
      return;
    }

    // Place the component
    const newPlaced: PlacedComponent = {
      id: `placed-${Date.now()}`,
      componentId,
      x: Math.max(0, Math.min(x, containerSize.width - 160)),
      y: Math.max(60, Math.min(y, containerSize.height - 100)),
    };

    setPlacedComponents((prev) => [...prev, newPlaced]);
    const compLabel = FLOW_COMPONENTS.find((c) => c.id === componentId)?.label;
    showToast(`${compLabel} placed!`, "success");

    // Auto-connect pipe if there's a previous component
    const lastPlaced = getLastPlacedComponent();
    if (lastPlaced) {
      setConnections((prev) => [
        ...prev,
        { fromId: lastPlaced.id, toId: newPlaced.id },
      ]);
    }

    setDraggedComponent(null);
  }, [placedComponents, wrongAttempts, containerSize, isCorrectNextComponent, getNextExpectedComponent, getLastPlacedComponent, showToast]);

  // Handle drag over canvas
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Generate elbow pipe path
  const generatePipePath = useCallback((from: PlacedComponent, to: PlacedComponent): string => {
    const fromX = from.x + 80;
    const fromY = from.y + 40;
    const toX = to.x + 80;
    const toY = to.y + 40;

    const midX = (fromX + toX) / 2;

    // Smooth bezier curve
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    setPlacedComponents([]);
    setConnections([]);
    setWrongAttempts(0);
    hasCompletedRef.current = false;
    setIsComplete(false);
    showToast("Canvas reset", "info");
  }, [showToast]);

  // Progress
  const progress = Math.round((placedComponents.length / FLOW_COMPONENTS.length) * 100);

  // Get component info
  const getComponentInfo = (id: string) => FLOW_COMPONENTS.find((c) => c.id === id);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: BRAND.indigo }}>
      {/* Ocean/Sea SVG Background */}
      <svg className="fixed inset-0 w-full h-full z-0" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a365d" />
            <stop offset="40%" stopColor="#1e4976" />
            <stop offset="70%" stopColor="#2a6bb5" />
            <stop offset="100%" stopColor="#3b82a0" />
          </linearGradient>
          
          <pattern id="wavePattern" x="0" y="0" width="200" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
          
          <radialGradient id="bubbleGradient">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#oceanGradient)"/>
        
        <g opacity="0.3">
          <rect width="100%" height="100%" fill="url(#wavePattern)" transform="translate(0, 0)"/>
          <rect width="100%" height="100%" fill="url(#wavePattern)" transform="translate(0, 40)"/>
          <rect width="100%" height="100%" fill="url(#wavePattern)" transform="translate(0, 80)"/>
        </g>
        
        <g className="animate-pulse" opacity="0.1">
          <path d="M0 200 Q200 180 400 200 T800 200 T1200 200 T1600 200 T2000 200" stroke={BRAND.blue} strokeWidth="2" fill="none"/>
          <path d="M0 400 Q200 380 400 400 T800 400 T1200 400 T1600 400 T2000 400" stroke={BRAND.blue} strokeWidth="2" fill="none"/>
          <path d="M0 600 Q200 580 400 600 T800 600 T1200 600 T1600 600 T2000 600" stroke={BRAND.blue} strokeWidth="2" fill="none"/>
        </g>
        
        <circle cx="10%" cy="80%" r="4" fill="url(#bubbleGradient)" opacity="0.3"/>
        <circle cx="25%" cy="70%" r="3" fill="url(#bubbleGradient)" opacity="0.2"/>
        <circle cx="40%" cy="85%" r="5" fill="url(#bubbleGradient)" opacity="0.25"/>
        <circle cx="60%" cy="75%" r="3" fill="url(#bubbleGradient)" opacity="0.2"/>
        <circle cx="75%" cy="90%" r="4" fill="url(#bubbleGradient)" opacity="0.3"/>
        <circle cx="90%" cy="80%" r="3" fill="url(#bubbleGradient)" opacity="0.2"/>
        
        <pattern id="gridPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(42,107,181,0.08)" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#gridPattern)"/>
      </svg>

      {/* Main Layout */}
      <div className="relative z-10 h-screen p-4 flex gap-4">
        
        {/* LEFT PANEL: Task Info + Toolbox */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          
          {/* Task Panel */}
          <motion.div
            className="rounded-2xl overflow-hidden flex-shrink-0"
            style={{
              background: `${BRAND.indigo}E0`,
              border: `1px solid ${BRAND.blue}40`,
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${BRAND.blue}30` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND.yellow}20`, color: BRAND.yellow }}>
                  {ICONS.oil}
                </div>
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: BRAND.white }}>Oil & Gas Flow</h2>
                  <p className="text-[10px]" style={{ color: `${BRAND.white}60` }}>{userName}</p>
                </div>
              </div>
              <Timer timeLeft={timeLeft} totalTime={TIMER_DURATION} />
            </div>

            <div className="p-4 space-y-3">
              <h3 className="text-base font-bold" style={{ color: BRAND.yellow }}>Build the Pipeline</h3>
              <p className="text-xs leading-relaxed" style={{ color: `${BRAND.white}90` }}>
                Drag components from below and drop them on the canvas in the correct order. Pipes will connect automatically!
              </p>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: `${BRAND.white}60` }}>Progress</span>
                  <span className="text-[10px] font-bold" style={{ color: BRAND.yellow }}>{progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${BRAND.blue}30` }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: BRAND.yellow }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px]" style={{ color: `${BRAND.white}50` }}>Placed</p>
                  <p className="text-lg font-bold" style={{ color: BRAND.white }}>
                    {placedComponents.length}/{FLOW_COMPONENTS.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: `${BRAND.white}50` }}>Wrong</p>
                  <p className="text-lg font-bold" style={{ color: wrongAttempts > 0 ? "#EF4444" : BRAND.white }}>
                    {wrongAttempts}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
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

          {/* Component Toolbox */}
          <motion.div
            className="flex-1 rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: `${BRAND.indigo}E0`,
              border: `1px solid ${BRAND.blue}40`,
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BRAND.blue}30` }}>
              <h3 className="text-sm font-bold" style={{ color: BRAND.white }}>Components</h3>
              <p className="text-[10px]" style={{ color: `${BRAND.white}60` }}>Drag to canvas in order</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {shuffledComponents.map((comp) => {
                const isPlaced = placedComponents.some((p) => p.componentId === comp.id);

                return (
                  <motion.div
                    key={comp.id}
                    draggable={!isPlaced}
                    onDragStart={(e) => {
                      if (!isPlaced) {
                        (e as unknown as React.DragEvent).dataTransfer?.setData("componentId", comp.id);
                        handleDragStart(comp.id);
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-xl transition-all ${
                      isPlaced ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:scale-102"
                    }`}
                    style={{
                      background: isPlaced
                        ? `${BRAND.blue}20`
                        : `${BRAND.blue}40`,
                      border: `1px solid ${BRAND.blue}50`,
                    }}
                    whileHover={!isPlaced ? { scale: 1.02 } : {}}
                    whileTap={!isPlaced ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex-shrink-0" style={{ color: BRAND.yellow }}>
                        {ICONS[comp.icon as keyof typeof ICONS]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold truncate" style={{ color: BRAND.white }}>
                            {comp.label}
                          </p>
                          {isPlaced && (
                            <span className="w-4 h-4 flex items-center justify-center rounded-full" style={{ background: BRAND.yellow, color: BRAND.indigo }}>
                              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] truncate" style={{ color: `${BRAND.white}60` }}>
                          {comp.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Canvas Area */}
        <div className="flex-1 relative">
          <motion.div
            ref={canvasRef}
            className="w-full h-full rounded-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}15 0%, ${BRAND.indigo}40 100%)`,
              border: draggedComponent
                ? `3px dashed ${BRAND.yellow}`
                : `1px solid ${BRAND.blue}40`,
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleDragOver}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Stage columns */}
            <div className="absolute inset-0 flex pointer-events-none">
              {["upstream", "midstream", "downstream"].map((stage) => (
                <div
                  key={stage}
                  className="flex-1 border-r last:border-r-0"
                  style={{ borderColor: `${BRAND.blue}20` }}
                >
                  <div
                    className="m-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
                    style={{
                      background: `${STAGE_COLORS[stage]}15`,
                      color: STAGE_COLORS[stage],
                      border: `1px solid ${STAGE_COLORS[stage]}30`,
                    }}
                  >
                    <svg viewBox="0 0 8 8" className="w-2 h-2" fill="currentColor">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </div>
                </div>
              ))}
            </div>

            {/* Drop zone hint */}
            {placedComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8 rounded-2xl" style={{ background: `${BRAND.blue}20` }}>
                  <div className="w-12 h-12 mx-auto mb-4" style={{ color: BRAND.white }}>
                    {ICONS.drop}
                  </div>
                  <p className="text-sm font-medium" style={{ color: BRAND.white }}>
                    Drop components here
                  </p>
                  <p className="text-xs mt-1" style={{ color: `${BRAND.white}60` }}>
                    Start with Oil Reservoir
                  </p>
                </div>
              </div>
            )}

            {/* SVG Pipes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 5 }}>
              <defs>
                <filter id="pipeGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {connections.map((conn, i) => {
                const from = placedComponents.find((p) => p.id === conn.fromId);
                const to = placedComponents.find((p) => p.id === conn.toId);
                if (!from || !to) return null;

                return (
                  <g key={`pipe-${i}`}>
                    {/* Outer glow pipe */}
                    <motion.path
                      d={generatePipePath(from, to)}
                      fill="none"
                      stroke={`${BRAND.yellow}40`}
                      strokeWidth="18"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                    {/* Main pipe */}
                    <motion.path
                      d={generatePipePath(from, to)}
                      fill="none"
                      stroke={BRAND.yellow}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Placed Components */}
            {placedComponents.map((placed, index) => {
              const comp = getComponentInfo(placed.componentId);
              if (!comp) return null;

              return (
                <motion.div
                  key={placed.id}
                  className="absolute"
                  style={{
                    left: placed.x,
                    top: placed.y,
                    zIndex: 10,
                  }}
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div
                    className="px-4 py-3 rounded-2xl backdrop-blur-md min-w-[160px]"
                    style={{
                      background: `${BRAND.indigo}E0`,
                      border: `2px solid ${BRAND.yellow}`,
                      boxShadow: `0 0 30px ${BRAND.yellow}40, 0 8px 32px rgba(0,0,0,0.3)`,
                    }}
                  >
                    {/* Order badge */}
                    <div
                      className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: BRAND.yellow, color: BRAND.indigo }}
                    >
                      {index + 1}
                    </div>

                    {/* Stage badge */}
                    <div
                      className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      style={{ background: STAGE_COLORS[comp.stage], color: BRAND.white }}
                    >
                      {comp.stage}
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-10 h-10 flex-shrink-0" style={{ color: BRAND.yellow }}>
                        {ICONS[comp.icon as keyof typeof ICONS]}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: BRAND.white }}>{comp.label}</p>
                        <p className="text-[10px]" style={{ color: `${BRAND.white}70` }}>{comp.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Completion Overlay */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  style={{ background: `${BRAND.indigo}95` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="text-center p-8 rounded-3xl max-w-md"
                    style={{ background: BRAND.white }}
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND.yellow }}>
                      {ICONS.trophy}
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.indigo }}>
                      Pipeline Complete!
                    </h2>
                    <p className="text-sm mb-4" style={{ color: `${BRAND.indigo}80` }}>
                      You have successfully built the oil production flow from reservoir to tanker.
                    </p>
                    <div className="flex justify-center gap-8 mb-4">
                      <div>
                        <p className="text-3xl font-bold" style={{ color: BRAND.yellow }}>{calculateScore()}</p>
                        <p className="text-xs" style={{ color: `${BRAND.indigo}60` }}>Points</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold" style={{ color: BRAND.blue }}>{timeLeft}s</p>
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

      {/* Toasts */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-[100]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="px-4 py-3 rounded-xl shadow-lg min-w-[220px] flex items-center gap-2"
              style={{
                background: toast.type === "error" ? "rgba(239, 68, 68, 0.95)" 
                  : toast.type === "success" ? "rgba(34, 197, 94, 0.95)"
                  : "rgba(59, 130, 246, 0.95)",
                color: BRAND.white,
              }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              {toast.type === "success" && <div className="w-5 h-5 flex-shrink-0">{ICONS.check}</div>}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[200]"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              className="max-w-md mx-4 p-6 rounded-3xl"
              style={{ background: BRAND.white }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-3" style={{ background: `${BRAND.yellow}20`, color: BRAND.yellow }}>
                  {ICONS.hint}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: BRAND.indigo }}>Think About It...</h3>
                  <p className="text-sm" style={{ color: `${BRAND.indigo}60` }}>Hint {hintIndex + 1} of {HINTS.length}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl mb-4" style={{ background: `${BRAND.blue}10` }}>
                <p className="text-base leading-relaxed" style={{ color: BRAND.indigo }}>
                  {HINTS[hintIndex]}
                </p>
              </div>

              <div className="mb-4 p-3 rounded-xl" style={{ background: `${BRAND.indigo}08` }}>
                <p className="text-xs" style={{ color: `${BRAND.indigo}70` }}>
                  Remember: Oil flows from its natural source, through extraction and collection equipment, gets transported to processing facilities, then stored before export.
                </p>
              </div>

              <button
                onClick={() => setShowHintModal(false)}
                className="w-full py-3 rounded-xl font-bold"
                style={{ background: BRAND.yellow, color: BRAND.indigo }}
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
