"use client";

/**
 * CanvasClient - Client-side implementation of the Plant Builder
 * 
 * Handles all interactive state and renders the 3-panel layout.
 * This is separated from page.tsx to keep "use client" isolated.
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 */

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { getUserDataAsync } from "@/lib/utils";
import { computeScore } from "@/src/components/plant/rules";

// Import canvas components
import {
  type PlacedComponent,
  type PipeConnection,
  type ValidationMessage,
  type ComponentDefinition,
  type CanvasItem,
  ENGINEERING_SEQUENCES,
  SECTOR_COLORS,
  TIMER_DURATION,
  COMPONENT_HALF,
  SlotPanel,
  Toolbox,
  BlueprintCanvas,
  StatusPanel,
  WelcomeOverlay,
  CompletionOverlay,
  DragPreview,
} from "@/components/canvas";

// Brand colors
const BRAND_INDIGO = "#2E3093";
const BRAND_BLUE = "#2A6BB5";
const BRAND_YELLOW = "#FAE452";

// ============================================
// SLOT POSITIONS ON CANVAS
// Automatically position components based on slot order
// ============================================
const SLOT_CANVAS_POSITIONS: Record<string, { x: number; y: number }> = {
  SOURCE: { x: 10, y: 50 },
  PRESSURIZATION: { x: 25, y: 35 },
  THERMAL: { x: 40, y: 50 },
  REACTION: { x: 55, y: 35 },
  PROCESS: { x: 55, y: 65 },
  SEPARATION: { x: 70, y: 50 },
  DISTRIBUTION: { x: 70, y: 25 },
  STORAGE: { x: 85, y: 50 },
  SAFETY: { x: 85, y: 75 },
  CONTROL: { x: 50, y: 85 },
};

export function CanvasClient() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  // ============================================
  // STATE: User and initialization
  // ============================================
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userSector, setUserSector] = useState<string>("");
  const [sectorColor, setSectorColor] = useState(BRAND_YELLOW);
  const [isClient, setIsClient] = useState(false); // Hydration guard
  const [showWelcome, setShowWelcome] = useState(true);

  // ============================================
  // STATE: Timer (2 minutes countdown)
  // ============================================
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);

  // ============================================
  // STATE: Game mechanics
  // ============================================
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pipes, setPipes] = useState<PipeConnection[]>([]); // Reserved for pipe connections
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // Slot state: maps slotId -> componentId or null
  const [slots, setSlots] = useState<Record<string, string | null>>({
    SOURCE: null,
    PRESSURIZATION: null,
    THERMAL: null,
    REACTION: null,
    PROCESS: null,
    SEPARATION: null,
    DISTRIBUTION: null,
    STORAGE: null,
    SAFETY: null,
    CONTROL: null,
  });

  // Canvas items state: components placed on blueprint canvas
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);

  // Counter for unique IDs (avoids Date.now() hydration issues)
  const idCounterRef = useRef(0);

  // ============================================
  // MEMOIZED: Get components for current sector
  // ============================================
  const sectorComponents = useMemo((): ComponentDefinition[] => {
    return userSector ? ENGINEERING_SEQUENCES[userSector] || [] : [];
  }, [userSector]);

  // ============================================
  // COMPUTED: Progress percentage
  // Note: Now computed inside StatusPanel via computePlantStatus
  // ============================================
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const progress = sectorComponents.length > 0
    ? Math.round((placedComponents.length / sectorComponents.length) * 100)
    : 0;

  // ============================================
  // EFFECT: Client-side initialization
  // Loads user data from MongoDB session
  // ============================================
  useEffect(() => {
    const loadUserData = async () => {
      // Fetch user data from MongoDB session
      const userData = await getUserDataAsync();
      if (!userData || !userData.sector) {
        router.push("/");
        return;
      }

      // Use requestAnimationFrame to batch state updates
      // This avoids the cascading render lint warning
      requestAnimationFrame(() => {
        setUserName(userData.name);
        setUserPhone(userData.phone);
        setUserSector(userData.sector || "");
        setSectorColor(SECTOR_COLORS[userData.sector || ""] || BRAND_YELLOW);
        setIsClient(true);
      });

      // Hide welcome overlay after 2 seconds, then start timer and session
      setTimeout(async () => {
        setShowWelcome(false);
        
        // Start server-side session tracking (prevents timer manipulation)
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
      }, 2000);
    };

    loadUserData();
  }, [router]);

  // ============================================
  // FUNCTION: Generate unique ID
  // Uses counter to avoid SSR hydration mismatches
  // ============================================
  const generateId = useCallback((prefix: string): string => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  }, []);

  // ============================================
  // FUNCTION: Save score to database
  // ============================================
  const saveScore = useCallback(async (currentSlots: Record<string, string | null>, currentTimeLeft: number) => {
    try {
      const score = computeScore(currentSlots);
      const response = await fetch("/api/user/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userPhone,
          name: userName,
          sector: userSector,
          score,
          slots: currentSlots,
          timeLeft: currentTimeLeft,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error("Failed to save score");
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  }, [userPhone, userName, userSector]);

  // ============================================
  // FUNCTION: Add validation message
  // ============================================
  const addValidationMessage = useCallback(
    (type: ValidationMessage["type"], message: string) => {
      const newMsg: ValidationMessage = {
        id: generateId("msg"),
        type,
        message,
      };
      setValidationMessages((prev) => [newMsg, ...prev].slice(0, 6));
    },
    [generateId]
  );

  // ============================================
  // FUNCTION: Handle slot drop (from SlotPanel)
  // Assigns component to slot AND places on canvas automatically
  // ============================================
  const handleSlotDrop = useCallback((slotId: string, componentId: string) => {
    // Update slot assignment
    setSlots((prev) => ({
      ...prev,
      [slotId]: componentId,
    }));
    
    // Auto-place component on canvas at predetermined position
    const position = SLOT_CANVAS_POSITIONS[slotId] || { x: 50, y: 50 };
    const newItem: CanvasItem = {
      id: crypto.randomUUID(),
      componentId,
      x: position.x,
      y: position.y,
    };
    setCanvasItems((prev) => {
      // Remove any existing item with same componentId to avoid duplicates
      const filtered = prev.filter(item => item.componentId !== componentId);
      return [...filtered, newItem];
    });
    
    // Clear the selected tool after successful placement
    setSelectedTool(null);
  }, []);

  // ============================================
  // FUNCTION: Handle slot clear (from SlotPanel)
  // Also removes component from canvas
  // ============================================
  const handleSlotClear = useCallback((slotId: string) => {
    // Get the componentId before clearing
    setSlots((prev) => {
      const componentId = prev[slotId];
      // Remove from canvas if it was placed
      if (componentId) {
        setCanvasItems((items) => items.filter(item => item.componentId !== componentId));
      }
      return {
        ...prev,
        [slotId]: null,
      };
    });
  }, []);

  // ============================================
  // FUNCTION: Reset plant
  // Clears slots, canvas items, and messages
  // ============================================
  const handleResetPlant = useCallback(() => {
    setSlots({
      SOURCE: null,
      PRESSURIZATION: null,
      THERMAL: null,
      REACTION: null,
      PROCESS: null,
      SEPARATION: null,
      DISTRIBUTION: null,
      STORAGE: null,
      SAFETY: null,
      CONTROL: null,
    });
    setCanvasItems([]);
    setPlacedComponents([]);
    setPipes([]);
    setValidationMessages([]);
    setIsComplete(false);
    setSelectedTool(null);
    addValidationMessage("info", "Plant reset - ready to build!");
  }, [addValidationMessage]);

  // ============================================
  // FUNCTION: Handle canvas item move
  // ============================================
  const handleCanvasItemMove = useCallback((itemId: string, x: number, y: number) => {
    setCanvasItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, x, y } : item
      )
    );
  }, []);

  // ============================================
  // FUNCTION: Handle canvas item delete
  // ============================================
  const handleCanvasItemDelete = useCallback((itemId: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== itemId));
    addValidationMessage("info", "Removed component from canvas");
  }, [addValidationMessage]);

  // Track if we've shown the times up message
  const hasShownTimesUp = useRef(false);
  
  // Ref to track current slots for timer callback
  const slotsRef = useRef(slots);
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  // ============================================
  // EFFECT: Timer countdown
  // ============================================
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          // Save score and navigate to thank you page when time is up
          if (!hasShownTimesUp.current && !isComplete) {
            hasShownTimesUp.current = true;
            // Save score before navigating
            saveScore(slotsRef.current, 0);
            setTimeout(() => {
              router.push("/thank-you");
            }, 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isComplete, router, saveScore]);

  // ============================================
  // FUNCTION: Handle end simulation
  // Saves score and navigates to thank you page
  // ============================================
  const handleEndSimulation = useCallback(async () => {
    await saveScore(slots, timeLeft);
    router.push("/thank-you");
  }, [saveScore, slots, timeLeft, router]);

  // ============================================
  // FUNCTION: Check if component can be placed
  // ============================================
  const canPlaceComponent = useCallback(
    (componentId: string): { valid: boolean; reason: string } => {
      const component = sectorComponents.find((c) => c.id === componentId);
      if (!component) {
        return { valid: false, reason: "Unknown component" };
      }

      if (placedComponents.some((p) => p.componentId === componentId)) {
        return { valid: false, reason: `${component.name} already placed` };
      }

      for (const reqId of component.requiredBefore) {
        if (!placedComponents.some((p) => p.componentId === reqId)) {
          const reqComp = sectorComponents.find((c) => c.id === reqId);
          return { valid: false, reason: `Place ${reqComp?.name} first!` };
        }
      }

      return { valid: true, reason: "Ready" };
    },
    [sectorComponents, placedComponents]
  );

  // ============================================
  // FUNCTION: Generate pipe connections
  // ============================================
  const generatePipes = useCallback(
    (components: PlacedComponent[]) => {
      const newPipes: PipeConnection[] = [];

      for (const placed of components) {
        const compDef = sectorComponents.find((c) => c.id === placed.componentId);
        if (!compDef) continue;

        for (const targetId of compDef.connectsTo) {
          const targetPlaced = components.find((p) => p.componentId === targetId);
          if (targetPlaced) {
            newPipes.push({
              id: `pipe-${placed.componentId}-${targetId}`,
              from: placed.componentId,
              to: targetId,
              fromX: placed.x + COMPONENT_HALF,
              fromY: placed.y + COMPONENT_HALF,
              toX: targetPlaced.x + COMPONENT_HALF,
              toY: targetPlaced.y + COMPONENT_HALF,
            });
          }
        }
      }

      setPipes(newPipes);
    },
    [sectorComponents]
  );

  // ============================================
  // HANDLER: Drag start (will be passed to SlotPanel when made interactive)
  // Currently unused as SlotPanel is a placeholder
  // ============================================
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = useCallback(
    (componentId: string, e: React.MouseEvent | React.TouchEvent) => {
      const validation = canPlaceComponent(componentId);
      if (!validation.valid) {
        addValidationMessage("error", `⚠️ ${validation.reason}`);
        return;
      }

      setDraggingComponent(componentId);

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setDragPosition({ x: clientX, y: clientY });
    },
    [canPlaceComponent, addValidationMessage]
  );

  // ============================================
  // HANDLER: Drag move
  // ============================================
  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!draggingComponent) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setDragPosition({ x: clientX, y: clientY });
    },
    [draggingComponent]
  );

  // ============================================
  // HANDLER: Drop on canvas
  // ============================================
  const handleDrop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!draggingComponent || !canvasRef.current) {
        setDraggingComponent(null);
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.changedTouches[0].clientY : e.clientY;

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setDraggingComponent(null);
        addValidationMessage("warning", "Drop inside the blueprint area");
        return;
      }

      const x = clientX - rect.left - COMPONENT_HALF;
      const y = clientY - rect.top - COMPONENT_HALF;

      const component = sectorComponents.find((c) => c.id === draggingComponent);
      if (!component) {
        setDraggingComponent(null);
        return;
      }

      const slotIndex = placedComponents.length;
      const newPlaced: PlacedComponent = {
        id: generateId("placed"),
        componentId: draggingComponent,
        name: component.name,
        emoji: component.emoji,
        x: Math.max(0, Math.min(x, rect.width - COMPONENT_HALF * 2)),
        y: Math.max(0, Math.min(y, rect.height - COMPONENT_HALF * 2)),
        slotIndex,
      };

      const updatedComponents = [...placedComponents, newPlaced];
      setPlacedComponents(updatedComponents);
      generatePipes(updatedComponents);
      addValidationMessage("success", `✅ ${component.name} connected!`);

      if (updatedComponents.length === sectorComponents.length) {
        setIsComplete(true);
        setTimerActive(false);
        addValidationMessage("success", "🎉 Plant Complete!");
      }

      setDraggingComponent(null);
    },
    [
      draggingComponent,
      sectorComponents,
      placedComponents,
      generatePipes,
      addValidationMessage,
      generateId,
    ]
  );

  // ============================================
  // RENDER: Loading state (before hydration)
  // ============================================
  if (!isClient) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: BRAND_INDIGO }}
      >
        <div style={{ color: `${BRAND_YELLOW}80` }}>Loading...</div>
      </div>
    );
  }

  // ============================================
  // RENDER: Main 3-column responsive layout
  // ============================================
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: BRAND_INDIGO }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDrop}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDrop}
    >
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(${BRAND_BLUE}10 1px, transparent 1px),
            linear-gradient(90deg, ${BRAND_BLUE}10 1px, transparent 1px)
          `,
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
            totalComponents={sectorComponents.length}
            sectorColor={sectorColor}
          />
        )}
      </AnimatePresence>

      {/* ========================================
          RESPONSIVE 3-PANEL LAYOUT
          Desktop: flex-row (3 columns)
          Mobile: flex-col (stacked)
          ======================================== */}
      <div className="relative z-10 h-screen p-3 flex flex-col lg:flex-row gap-3">
        
        {/* LEFT SIDEBAR: Slots + Toolbox */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-3 lg:h-full h-auto">
          {/* Slot Panel - takes available space on desktop */}
          <div className="flex-1 min-h-[200px] lg:min-h-0">
            <SlotPanel
              sector={userSector}
              slots={slots}
              onSlotDrop={handleSlotDrop}
              onSlotClear={handleSlotClear}
              onMessage={addValidationMessage}
            />
          </div>
          
          {/* Toolbox - takes available space for scrolling */}
          <div className="flex-1 min-h-[250px] lg:min-h-0 overflow-hidden">
            <Toolbox
              sector={userSector}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              onDragStart={(componentId) => setDraggingComponent(componentId)}
            />
          </div>
        </aside>

        {/* CENTER: Blueprint Canvas */}
        <main className="flex-1 min-h-[300px] lg:min-h-0 relative">
          <BlueprintCanvas
            ref={canvasRef}
            userName={userName}
            sector={userSector}
            isDragging={!!draggingComponent}
            timeLeft={timeLeft}
            slots={slots}
            canvasItems={canvasItems}
            onItemMove={handleCanvasItemMove}
            onItemDelete={handleCanvasItemDelete}
            onMessage={addValidationMessage}
            onEnd={handleEndSimulation}
          />
        </main>

        {/* RIGHT SIDEBAR: Status Panel */}
        <aside className="w-full lg:w-64 flex-shrink-0 lg:h-full h-auto min-h-[200px]">
          <StatusPanel
            sector={userSector}
            slots={slots}
            canvasItems={canvasItems}
            messages={validationMessages}
            onReset={handleResetPlant}
          />
        </aside>
      </div>
    </div>
  );
}
