"use client";

/**
 * CanvasClient V2 - Redesigned Plant Builder Layout
 * 
 * Layout:
 * - Left: Task Panel (task description + timer) + Components Panel (toolbox)
 * - Right: Build Area (slots integrated into canvas)
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 */

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getUserDataAsync } from "@/lib/utils";
import { computeScore } from "@/src/components/plant/rules";
import {
  type ValidationMessage,
  SECTOR_COLORS,
  TIMER_DURATION,
  WelcomeOverlay,
  CompletionOverlay,
} from "@/components/canvas";
import { Timer } from "@/components/canvas/Timer";
import { TutorialOverlay } from "@/components/canvas/TutorialOverlay";
import {
  CATEGORIES,
  ICONS,
  getComponentsBySector,
  getComponentById,
} from "@/src/components/plant/catalog";
import {
  SLOT_ORDER,
  SLOT_DISPLAY_NAMES,
  computePlantStatus,
  type SlotId,
} from "@/src/components/plant/rules";

// Brand colors
const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
};

// Slot positions on the build area grid
const SLOT_POSITIONS: Record<string, { row: number; col: number }> = {
  SOURCE: { row: 0, col: 0 },
  PRESSURIZATION: { row: 0, col: 1 },
  THERMAL: { row: 0, col: 2 },
  REACTION: { row: 1, col: 0 },
  PROCESS: { row: 1, col: 1 },
  SEPARATION: { row: 1, col: 2 },
  DISTRIBUTION: { row: 2, col: 0 },
  STORAGE: { row: 2, col: 1 },
  SAFETY: { row: 2, col: 2 },
  CONTROL: { row: 3, col: 1 },
};

// Task descriptions for each sector
const SECTOR_TASKS: Record<string, { title: string; description: string; steps: string[] }> = {
  oilgas: {
    title: "Build an Oil & Gas Production Facility",
    description: "Design a complete oil production system from extraction to export, following the Upstream → Midstream → Downstream flow.",
    steps: [
      "🔵 UPSTREAM: Place Oil Reservoir (underground source)",
      "🔵 UPSTREAM: Add Drilling Rig (extraction)",
      "🔵 UPSTREAM: Connect Floating Offshore Platform",
      "🟡 MIDSTREAM: Add Pipeline to Onshore (transport)",
      "🟢 DOWNSTREAM: Place Oil and Water Separator",
      "🟢 DOWNSTREAM: Add Storage Tank",
      "🟢 DOWNSTREAM: Complete with Tanker (export)",
    ],
  },
  process: {
    title: "Build a Chemical Processing Plant",
    description: "Design and assemble a complete chemical processing facility by placing components in the correct slots.",
    steps: [
      "Start with the SOURCE component (feedstock input)",
      "Add PRESSURIZATION to control flow",
      "Include THERMAL for temperature management",
      "Set up REACTION vessel for processing",
      "Configure SEPARATION for output",
      "Add STORAGE and SAFETY systems",
      "Complete with CONTROL systems",
    ],
  },
  hvac: {
    title: "Build an HVAC System",
    description: "Design a complete heating, ventilation, and air conditioning system for a commercial building.",
    steps: [
      "Begin with air SOURCE (intake/return)",
      "Add PRESSURIZATION (fans/blowers)",
      "Include THERMAL components (heating/cooling)",
      "Set up air PROCESS (filtering/treatment)",
      "Configure DISTRIBUTION (ductwork)",
      "Add CONTROL systems for automation",
    ],
  },
  water: {
    title: "Build a Water Treatment Plant",
    description: "Design a water treatment facility from intake to distribution.",
    steps: [
      "Start with water SOURCE (intake)",
      "Add PRESSURIZATION (pumps)",
      "Include PROCESS (filtration/treatment)",
      "Set up SEPARATION (settling tanks)",
      "Configure STORAGE (reservoirs)",
      "Add DISTRIBUTION and CONTROL",
    ],
  },
  power: {
    title: "Build a Power Generation System",
    description: "Design a power generation facility with proper energy flow.",
    steps: [
      "Begin with energy SOURCE",
      "Add THERMAL components (boilers/turbines)",
      "Set up REACTION (generators)",
      "Configure DISTRIBUTION (grid connection)",
      "Add SAFETY and CONTROL systems",
    ],
  },
  fire: {
    title: "Build a Fire Protection System",
    description: "Design a comprehensive fire protection system for a facility.",
    steps: [
      "Start with water SOURCE",
      "Add PRESSURIZATION (fire pumps)",
      "Set up DISTRIBUTION (sprinkler lines)",
      "Configure SAFETY systems (alarms)",
      "Add CONTROL (fire panel)",
    ],
  },
  electrical: {
    title: "Build an Electrical Distribution System",
    description: "Design an electrical distribution network for a facility.",
    steps: [
      "Begin with power SOURCE (utility feed)",
      "Add DISTRIBUTION (switchgear)",
      "Set up CONTROL (panels/breakers)",
      "Configure SAFETY (grounding)",
    ],
  },
};

export function CanvasClient() {
  const router = useRouter();

  // User state
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userSector, setUserSector] = useState("");
  const [sectorColor, setSectorColor] = useState(BRAND.yellow);
  const [isClient, setIsClient] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);

  // Game state - placed components on canvas
  const [placedComponents, setPlacedComponents] = useState<Array<{
    id: string;
    componentId: string;
    x: number;
    y: number;
  }>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([]);

  // Refs
  const hasShownTimesUp = useRef(false);
  const placedRef = useRef(placedComponents);
  const idCounterRef = useRef(0);

  useEffect(() => {
    placedRef.current = placedComponents;
  }, [placedComponents]);

  // Get components for current sector (returns grouped object)
  const sectorComponentsGrouped = useMemo(() => {
    if (!userSector) return {};
    return getComponentsBySector(userSector) || {};
  }, [userSector]);

  // Flatten components for counting
  const sectorComponentsFlat = useMemo(() => {
    const all: { id: string; label: string }[] = [];
    Object.values(sectorComponentsGrouped).forEach((group) => {
      if (Array.isArray(group)) {
        all.push(...group);
      }
    });
    return all;
  }, [sectorComponentsGrouped]);

  // Get task info
  const taskInfo = useMemo(() => {
    return SECTOR_TASKS[userSector] || {
      title: "Build Your Plant",
      description: "Place components in the correct slots to build your engineering system.",
      steps: ["Drag components from the left panel to the slots on the right"],
    };
  }, [userSector]);

  // Compute progress based on placed components
  const progress = useMemo(() => {
    if (sectorComponentsFlat.length === 0) return 0;
    return Math.round((placedComponents.length / sectorComponentsFlat.length) * 100);
  }, [placedComponents.length, sectorComponentsFlat.length]);

  // Check if sector needs tutorial
  const needsTutorial = useCallback((sector: string): boolean => {
    const normalizedSector = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
    // Add sectors that should show tutorial
    return ["oilgas", "oil&gas"].includes(normalizedSector);
  }, []);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const userData = await getUserDataAsync();
      if (!userData || !userData.sector) {
        router.push("/");
        return;
      }

      const sector = userData.sector || "";
      
      requestAnimationFrame(() => {
        setUserName(userData.name);
        setUserPhone(userData.phone);
        setUserSector(sector);
        setSectorColor(SECTOR_COLORS[sector] || BRAND.yellow);
        setIsClient(true);
      });

      setTimeout(async () => {
        setShowWelcome(false);
        
        // Show tutorial for specific sectors (like Oil & Gas)
        if (needsTutorial(sector)) {
          setShowTutorial(true);
          // Don't start timer yet - wait for tutorial completion
        } else {
          // No tutorial needed, start the session
          try {
            await fetch("/api/user/session/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: userData.phone }),
            });
          } catch (error) {
            console.error("Failed to start session:", error);
          }
          setTimerActive(true);
        }
      }, 2000);
    };

    loadUserData();
  }, [router, needsTutorial]);

  // Handle tutorial completion
  const handleTutorialComplete = useCallback(async () => {
    setShowTutorial(false);
    
    // Start the session after tutorial
    try {
      await fetch("/api/user/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userPhone }),
      });
    } catch (error) {
      console.error("Failed to start session:", error);
    }
    setTimerActive(true);
  }, [userPhone]);

  // Generate unique ID
  const generateId = useCallback((prefix: string): string => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  }, []);

  // Save score
  const saveScore = useCallback(async (currentPlaced: typeof placedComponents, currentTimeLeft: number) => {
    try {
      // Calculate score based on number of components placed
      const score = currentPlaced.length * 10;
      await fetch("/api/user/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userPhone,
          name: userName,
          sector: userSector,
          score,
          placedComponents: currentPlaced,
          timeLeft: currentTimeLeft,
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error saving score:", error);
    }
  }, [userPhone, userName, userSector]);

  // Add message
  const addMessage = useCallback((type: ValidationMessage["type"], message: string) => {
    const newMsg: ValidationMessage = {
      id: generateId("msg"),
      type,
      message,
    };
    setValidationMessages((prev) => [newMsg, ...prev].slice(0, 5));
  }, [generateId]);

  // Handle component drop on build area
  const handleComponentDrop = useCallback((componentId: string, x: number, y: number) => {
    // Check if component is already placed
    if (placedComponents.some(p => p.componentId === componentId)) {
      addMessage("warning", "Component already placed!");
      return;
    }
    
    const newComponent = {
      id: generateId("comp"),
      componentId,
      x,
      y,
    };
    setPlacedComponents(prev => [...prev, newComponent]);
    addMessage("success", "Component placed!");
  }, [placedComponents, generateId, addMessage]);

  // Handle component move
  const handleComponentMove = useCallback((id: string, x: number, y: number) => {
    setPlacedComponents(prev => 
      prev.map(comp => comp.id === id ? { ...comp, x, y } : comp)
    );
  }, []);

  // Handle component remove
  const handleComponentRemove = useCallback((id: string) => {
    setPlacedComponents(prev => prev.filter(comp => comp.id !== id));
    addMessage("info", "Component removed");
  }, [addMessage]);

  // Handle reset
  const handleReset = useCallback(() => {
    setPlacedComponents([]);
    setValidationMessages([]);
    setIsComplete(false);
    addMessage("info", "Build area cleared - ready to build!");
  }, [addMessage]);

  // Handle end
  const handleEnd = useCallback(async () => {
    await saveScore(placedComponents, timeLeft);
    router.push("/thank-you");
  }, [saveScore, placedComponents, timeLeft, router]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          if (!hasShownTimesUp.current && !isComplete) {
            hasShownTimesUp.current = true;
            saveScore(placedRef.current, 0);
            setTimeout(() => router.push("/thank-you"), 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isComplete, router, saveScore]);

  // Check completion - all components placed
  const prevComplete = useRef(false);
  useEffect(() => {
    const isAllPlaced = sectorComponentsFlat.length > 0 && 
      placedComponents.length >= sectorComponentsFlat.length;
    
    if (isAllPlaced && !prevComplete.current) {
      prevComplete.current = true;
      setTimeout(() => {
        setIsComplete(true);
        setTimerActive(false);
        addMessage("success", "🎉 All components placed!");
      }, 0);
    }
  }, [placedComponents.length, sectorComponentsFlat.length, addMessage]);

  // Loading state
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.indigo }}>
        <div style={{ color: `${BRAND.yellow}80` }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: BRAND.indigo }}>
      {/* Background grid */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(${BRAND.blue}10 1px, transparent 1px), linear-gradient(90deg, ${BRAND.blue}10 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && userSector && (
          <WelcomeOverlay sector={userSector} sectorColor={sectorColor} />
        )}
      </AnimatePresence>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <CompletionOverlay
            timeLeft={timeLeft}
            totalComponents={sectorComponentsFlat.length}
            sectorColor={sectorColor}
          />
        )}
      </AnimatePresence>

      {/* Tutorial overlay - shown for specific sectors like Oil & Gas */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay
            sector={userSector}
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      {/* Main Layout: Two columns */}
      <div className="relative z-10 h-screen p-4 flex gap-4">
        
        {/* LEFT COLUMN: Task + Components */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          
          {/* Task Panel */}
          <TaskPanel
            taskInfo={taskInfo}
            timeLeft={timeLeft}
            progress={progress}
            userName={userName}
            sector={userSector}
            onEnd={handleEnd}
            onReset={handleReset}
          />

          {/* Components Panel */}
          <ComponentsPanel
            sector={userSector}
            placedComponentIds={placedComponents.map(p => p.componentId)}
          />
        </div>

        {/* RIGHT COLUMN: Build Area */}
        <div className="flex-1">
          <BuildArea
            placedComponents={placedComponents}
            onComponentDrop={handleComponentDrop}
            onComponentMove={handleComponentMove}
            onComponentRemove={handleComponentRemove}
            messages={validationMessages}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// TASK PANEL
// ============================================
interface TaskPanelProps {
  taskInfo: { title: string; description: string; steps: string[] };
  timeLeft: number;
  progress: number;
  userName: string;
  sector: string;
  onEnd: () => void;
  onReset: () => void;
}

function TaskPanel({ taskInfo, timeLeft, progress, userName, sector, onEnd, onReset }: TaskPanelProps) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: `${BRAND.indigo}E0`,
        border: `1px solid ${BRAND.blue}40`,
        backdropFilter: "blur(10px)",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
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
            <svg className="w-4 h-4" style={{ color: BRAND.yellow }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: BRAND.white }}>Your Task</h2>
            <p className="text-[10px]" style={{ color: `${BRAND.white}60` }}>{userName} • {sector}</p>
          </div>
        </div>
        <Timer timeLeft={timeLeft} totalTime={TIMER_DURATION} />
      </div>

      {/* Task Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-base font-bold" style={{ color: BRAND.yellow }}>{taskInfo.title}</h3>
        <p className="text-xs leading-relaxed" style={{ color: `${BRAND.white}90` }}>{taskInfo.description}</p>
        
        {/* Steps */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: `${BRAND.white}50` }}>Steps</p>
          <ul className="space-y-1">
            {taskInfo.steps.slice(0, 4).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: `${BRAND.white}70` }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 mt-0.5" style={{ background: `${BRAND.blue}40`, color: BRAND.white }}>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
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

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onReset}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: `${BRAND.blue}30`, color: BRAND.white, border: `1px solid ${BRAND.blue}50` }}
          >
            Reset
          </button>
          <button
            onClick={onEnd}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
            style={{ background: BRAND.yellow, color: BRAND.indigo }}
          >
            Submit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// COMPONENTS PANEL
// ============================================
interface CatalogComponent {
  id: string;
  label: string;
  slotHint: string;
  category: string;
  icon: string;
  sectorTags: string[];
}

interface ComponentsPanelProps {
  sector: string;
  placedComponentIds: string[];
}

function ComponentsPanel({ sector, placedComponentIds }: ComponentsPanelProps) {
  // getComponentsBySector returns { categoryId: Component[] }
  const grouped = useMemo(() => {
    const result = getComponentsBySector(sector) || {};
    return result as Record<string, CatalogComponent[]>;
  }, [sector]);
  
  const usedComponentIds = useMemo(() => new Set(placedComponentIds), [placedComponentIds]);

  return (
    <motion.div
      className="flex-1 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: `${BRAND.indigo}E0`,
        border: `1px solid ${BRAND.blue}40`,
        backdropFilter: "blur(10px)",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${BRAND.blue}30` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${BRAND.yellow}20` }}
        >
          <svg className="w-4 h-4" style={{ color: BRAND.yellow }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: BRAND.white }}>Components</h2>
          <p className="text-[10px]" style={{ color: `${BRAND.white}60` }}>Drag to build area</p>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {Object.entries(grouped).map(([category, comps]) => {
          if (!comps || comps.length === 0) return null;
          // Find category label from CATEGORIES array
          const catInfo = (CATEGORIES as Array<{id: string; label: string}>).find(c => c.id === category);
          const categoryLabel = catInfo?.label || category;
          
          return (
            <div key={category}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: `${BRAND.white}50` }}>
                {categoryLabel}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {comps.map((comp: CatalogComponent) => {
                  const isUsed = usedComponentIds.has(comp.id);
                  const iconSvg = ICONS[comp.icon as keyof typeof ICONS] || ICONS.tank;
                  return (
                    <div
                      key={comp.id}
                      draggable={!isUsed}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("componentId", comp.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={`p-2 rounded-lg transition-all ${!isUsed ? "cursor-grab hover:scale-105 active:cursor-grabbing" : "cursor-not-allowed"}`}
                      style={{
                        background: isUsed ? `${BRAND.blue}20` : `${BRAND.blue}30`,
                        border: `1px solid ${isUsed ? `${BRAND.blue}20` : `${BRAND.blue}50`}`,
                        opacity: isUsed ? 0.5 : 1,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                          style={{ color: isUsed ? `${BRAND.white}50` : BRAND.yellow }}
                          dangerouslySetInnerHTML={{ __html: iconSvg }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium truncate" style={{ color: isUsed ? `${BRAND.white}50` : BRAND.white }}>
                            {comp.label}
                          </p>
                          <p className="text-[8px] truncate" style={{ color: `${BRAND.white}40` }}>
                            {comp.slotHint}
                          </p>
                        </div>
                      </div>
                      {isUsed && (
                        <div className="mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" style={{ color: "#4ADE80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[8px]" style={{ color: "#4ADE80" }}>Placed</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================
// BUILD AREA - Free-form canvas
// ============================================
interface PlacedComponent {
  id: string;
  componentId: string;
  x: number;
  y: number;
}

interface BuildAreaProps {
  placedComponents: PlacedComponent[];
  onComponentDrop: (componentId: string, x: number, y: number) => void;
  onComponentMove: (id: string, x: number, y: number) => void;
  onComponentRemove: (id: string) => void;
  messages: ValidationMessage[];
}

function BuildArea({ placedComponents, onComponentDrop, onComponentMove, onComponentRemove, messages }: BuildAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if leaving the container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const componentId = e.dataTransfer.getData("componentId");
    if (!componentId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp to reasonable bounds
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    onComponentDrop(componentId, clampedX, clampedY);
  };

  return (
    <motion.div
      className="h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: `${BRAND.indigo}80`,
        border: `2px solid ${isDragOver ? BRAND.yellow : BRAND.blue}40`,
        boxShadow: isDragOver ? `inset 0 0 30px ${BRAND.yellow}15` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${BRAND.blue}30` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${BRAND.yellow}20` }}
          >
            <svg className="w-4 h-4" style={{ color: BRAND.yellow }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: BRAND.white }}>Build Area</h2>
            <p className="text-[10px]" style={{ color: `${BRAND.white}60` }}>Drag & drop components here</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex items-center gap-2">
          {messages.slice(0, 1).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1 rounded-full text-[10px] font-medium"
              style={{
                background: msg.type === "success" ? "#4ADE8020" : msg.type === "error" ? "#EF444420" : `${BRAND.yellow}20`,
                color: msg.type === "success" ? "#4ADE80" : msg.type === "error" ? "#EF4444" : BRAND.yellow,
              }}
            >
              {msg.message}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Blueprint grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${BRAND.blue}15 1px, transparent 1px), linear-gradient(90deg, ${BRAND.blue}15 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Empty state */}
        {placedComponents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                style={{ background: `${BRAND.blue}20`, border: `2px dashed ${BRAND.blue}40` }}
              >
                <svg className="w-8 h-8" style={{ color: `${BRAND.white}30` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: `${BRAND.white}40` }}>Drag components here</p>
              <p className="text-xs mt-1" style={{ color: `${BRAND.white}25` }}>Build your system by placing components</p>
            </div>
          </div>
        )}

        {/* Placed Components */}
        {placedComponents.map((comp) => (
          <PlacedComponentCard
            key={comp.id}
            component={comp}
            containerRef={containerRef}
            onMove={onComponentMove}
            onRemove={onComponentRemove}
          />
        ))}

        {/* Drop indicator */}
        {isDragOver && (
          <motion.div
            className="absolute inset-4 rounded-xl pointer-events-none"
            style={{ 
              border: `2px dashed ${BRAND.yellow}`,
              background: `${BRAND.yellow}05`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// PLACED COMPONENT CARD - Draggable on canvas
// ============================================
interface PlacedComponentCardProps {
  component: PlacedComponent;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

function PlacedComponentCard({ component, containerRef, onMove, onRemove }: PlacedComponentCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; compX: number; compY: number } | null>(null);

  const catalogComponent = getComponentById(component.componentId);
  const iconSvg = catalogComponent ? ICONS[catalogComponent.icon as keyof typeof ICONS] || ICONS.tank : ICONS.tank;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setIsSelected(true);
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      compX: component.x,
      compY: component.y,
    };
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    
    const newX = Math.max(5, Math.min(95, dragStartRef.current.compX + deltaX));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.compY + deltaY));
    
    onMove(component.id, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{
        left: `${component.x}%`,
        top: `${component.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging || isSelected ? 20 : 10,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isDragging ? 1.1 : 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    >
      <div
        className="relative flex flex-col items-center p-3 rounded-xl"
        style={{
          background: BRAND.indigo,
          border: `2px solid ${isSelected ? BRAND.yellow : BRAND.blue}`,
          boxShadow: isSelected 
            ? `0 0 20px ${BRAND.yellow}40, 0 4px 12px rgba(0,0,0,0.3)` 
            : `0 4px 12px rgba(0,0,0,0.2)`,
          minWidth: "80px",
        }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 flex items-center justify-center mb-1"
          style={{ color: isSelected ? BRAND.yellow : BRAND.white }}
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
        
        {/* Label */}
        <span
          className="text-[10px] font-medium text-center leading-tight"
          style={{ color: isSelected ? BRAND.yellow : `${BRAND.white}CC` }}
        >
          {catalogComponent?.label || component.componentId}
        </span>

        {/* Remove button */}
        {isSelected && (
          <motion.button
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#EF4444", color: BRAND.white }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(component.id);
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
