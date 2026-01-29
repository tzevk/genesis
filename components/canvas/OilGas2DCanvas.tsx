"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThankYouOverlay from "./ThankYouOverlay";
import { saveScoreWithBackup } from "@/lib/utils";

// Brand colors - restricted palette
const COLORS = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  // Derived shades from primary colors
  darkBlue: "#1a1a5c",
  steel: "#2A6BB5",
  oceanLight: "#2A6BB5",
  oceanDark: "#2E3093",
};

// Component definitions (shuffled for challenge)
const COMPONENTS = [
  { id: "separator", name: "Separator", order: 5 },
  { id: "tanker", name: "Tanker", order: 7 },
  { id: "drilling", name: "Drilling Rig", order: 2 },
  { id: "storage", name: "Storage Tank", order: 6 },
  { id: "reservoir", name: "Reservoir", order: 1 },
  { id: "pipeline", name: "Pipeline", order: 4 },
  { id: "platform", name: "Platform", order: 3 },
];

const CORRECT_SEQUENCE = ["reservoir", "drilling", "platform", "pipeline", "separator", "storage", "tanker"];

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface PlacedComponent {
  id: string;
  componentId: string;
  x: number;
  y: number;
}

// ============ 2D COMPONENT ICONS (SVG) ============

function ReservoirIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Underground reservoir */}
      <ellipse cx="40" cy="55" rx="30" ry="15" fill={COLORS.indigo} />
      <rect x="10" y="40" width="60" height="15" fill={COLORS.indigo} />
      <ellipse cx="40" cy="40" rx="30" ry="12" fill={COLORS.blue} />
      {/* Oil bubbles */}
      <circle cx="30" cy="48" r="3" fill={COLORS.darkBlue} opacity="0.5" />
      <circle cx="50" cy="52" r="2" fill={COLORS.darkBlue} opacity="0.5" />
      <circle cx="40" cy="45" r="2.5" fill={COLORS.darkBlue} opacity="0.5" />
    </svg>
  );
}

function DrillingRigIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Derrick tower */}
      <polygon points="40,5 55,70 25,70" fill={COLORS.indigo} stroke={COLORS.yellow} strokeWidth="2" />
      {/* Cross beams */}
      <line x1="30" y1="25" x2="50" y2="25" stroke={COLORS.yellow} strokeWidth="2" />
      <line x1="28" y1="40" x2="52" y2="40" stroke={COLORS.yellow} strokeWidth="2" />
      <line x1="26" y1="55" x2="54" y2="55" stroke={COLORS.yellow} strokeWidth="2" />
      {/* Base platform */}
      <rect x="20" y="70" width="40" height="8" fill={COLORS.steel} rx="2" />
      {/* Drill string */}
      <line x1="40" y1="70" x2="40" y2="78" stroke={COLORS.steel} strokeWidth="3" />
    </svg>
  );
}

function PlatformIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Legs */}
      <rect x="15" y="45" width="5" height="35" fill={COLORS.steel} />
      <rect x="60" y="45" width="5" height="35" fill={COLORS.steel} />
      <rect x="37" y="50" width="6" height="30" fill={COLORS.steel} />
      {/* Main deck */}
      <rect x="5" y="40" width="70" height="10" fill={COLORS.blue} rx="2" />
      {/* Helipad */}
      <circle cx="20" cy="35" r="10" fill={COLORS.blue} stroke={COLORS.yellow} strokeWidth="2" />
      <text x="20" y="38" textAnchor="middle" fill={COLORS.white} fontSize="8" fontWeight="bold">H</text>
      {/* Processing unit */}
      <rect x="45" y="20" width="20" height="20" fill={COLORS.indigo} rx="2" />
      {/* Flare */}
      <rect x="68" y="10" width="3" height="30" fill={COLORS.steel} />
      <polygon points="69.5,5 65,12 74,12" fill={COLORS.yellow} />
    </svg>
  );
}

function PipelineIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Main pipe */}
      <rect x="5" y="35" width="70" height="12" fill={COLORS.steel} rx="6" />
      {/* Pipe segments */}
      <rect x="20" y="33" width="4" height="16" fill={COLORS.indigo} />
      <rect x="40" y="33" width="4" height="16" fill={COLORS.indigo} />
      <rect x="60" y="33" width="4" height="16" fill={COLORS.indigo} />
      {/* Flow indicators */}
      <circle cx="15" cy="41" r="3" fill={COLORS.yellow} />
      <circle cx="35" cy="41" r="3" fill={COLORS.yellow} />
      <circle cx="55" cy="41" r="3" fill={COLORS.yellow} />
      {/* Supports */}
      <rect x="25" y="47" width="6" height="20" fill={COLORS.darkBlue} />
      <rect x="50" y="47" width="6" height="20" fill={COLORS.darkBlue} />
    </svg>
  );
}

function SeparatorIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Main vessel */}
      <ellipse cx="40" cy="20" rx="25" ry="10" fill={COLORS.blue} />
      <rect x="15" y="20" width="50" height="40" fill={COLORS.blue} />
      <ellipse cx="40" cy="60" rx="25" ry="10" fill={COLORS.indigo} />
      {/* Separation layers */}
      <rect x="18" y="30" width="44" height="8" fill={COLORS.darkBlue} opacity="0.6" />
      <rect x="18" y="42" width="44" height="8" fill={COLORS.yellow} opacity="0.4" />
      {/* Inlet/outlet pipes */}
      <rect x="5" y="35" width="12" height="6" fill={COLORS.steel} />
      <rect x="63" y="25" width="12" height="6" fill={COLORS.steel} />
      <rect x="63" y="45" width="12" height="6" fill={COLORS.steel} />
      {/* Gauge */}
      <circle cx="40" cy="35" r="5" fill={COLORS.white} stroke={COLORS.indigo} strokeWidth="2" />
    </svg>
  );
}

function StorageTankIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Tank body */}
      <ellipse cx="40" cy="15" rx="28" ry="8" fill={COLORS.steel} />
      <rect x="12" y="15" width="56" height="50" fill={COLORS.blue} />
      <ellipse cx="40" cy="65" rx="28" ry="8" fill={COLORS.indigo} />
      {/* Tank stripes */}
      <rect x="12" y="25" width="56" height="3" fill={COLORS.yellow} />
      <rect x="12" y="45" width="56" height="3" fill={COLORS.yellow} />
      {/* Ladder */}
      <rect x="60" y="15" width="3" height="50" fill={COLORS.steel} />
      <rect x="58" y="25" width="7" height="2" fill={COLORS.steel} />
      <rect x="58" y="35" width="7" height="2" fill={COLORS.steel} />
      <rect x="58" y="45" width="7" height="2" fill={COLORS.steel} />
      <rect x="58" y="55" width="7" height="2" fill={COLORS.steel} />
      {/* Dome */}
      <ellipse cx="40" cy="15" rx="10" ry="4" fill={COLORS.indigo} />
    </svg>
  );
}

function TankerIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Hull */}
      <path d="M5,50 L10,60 L70,60 L75,50 L70,45 L10,45 Z" fill={COLORS.darkBlue} />
      {/* Deck */}
      <rect x="10" y="40" width="60" height="8" fill={COLORS.steel} />
      {/* Cargo tanks */}
      <ellipse cx="25" cy="35" rx="8" ry="6" fill={COLORS.blue} />
      <ellipse cx="45" cy="35" rx="8" ry="6" fill={COLORS.blue} />
      <ellipse cx="65" cy="35" rx="6" ry="5" fill={COLORS.blue} />
      {/* Bridge */}
      <rect x="10" y="25" width="12" height="15" fill={COLORS.white} />
      <rect x="12" y="27" width="3" height="4" fill={COLORS.indigo} />
      <rect x="17" y="27" width="3" height="4" fill={COLORS.indigo} />
      {/* Funnel */}
      <rect x="14" y="15" width="5" height="10" fill={COLORS.yellow} />
      {/* Wave line */}
      <path d="M0,58 Q10,55 20,58 T40,58 T60,58 T80,58" stroke={COLORS.oceanLight} strokeWidth="3" fill="none" />
    </svg>
  );
}

// Component icon renderer
function ComponentIcon({ componentId, size = 80 }: { componentId: string; size?: number }) {
  switch (componentId) {
    case "reservoir": return <ReservoirIcon size={size} />;
    case "drilling": return <DrillingRigIcon size={size} />;
    case "platform": return <PlatformIcon size={size} />;
    case "pipeline": return <PipelineIcon size={size} />;
    case "separator": return <SeparatorIcon size={size} />;
    case "storage": return <StorageTankIcon size={size} />;
    case "tanker": return <TankerIcon size={size} />;
    default: return null;
  }
}

// ============ MAIN CANVAS COMPONENT ============

interface OilGas2DCanvasProps {
  userName?: string;
  userPhone?: string;
  userSector?: string;
  isActive?: boolean;
  onComplete?: (score: number, timeLeft: number) => void;
  onExit?: () => void;
}

export function OilGas2DCanvas({ 
  userName = "Engineer",
  userPhone,
  userSector = "Oil & Gas",
  isActive = true,
  onComplete,
  onExit,
}: OilGas2DCanvasProps) {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [shuffledComponents] = useState(() => shuffleArray(COMPONENTS));
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(150);
  const [isComplete, setIsComplete] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastFault, setLastFault] = useState<string | null>(null);
  const [faultComponent, setFaultComponent] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Tutorial steps configuration
  const TUTORIAL_STEPS = [
    {
      id: "welcome",
      title: "Oil & Gas Plant Builder",
      description: "Build the complete oil production chain by dragging components in the correct order.",
      highlight: null,
      icon: "welcome",
    },
    {
      id: "toolbox",
      title: "Component Toolbox",
      description: "Drag components from here onto the canvas. They're shuffled - figure out the correct sequence!",
      highlight: "left-panel",
      icon: "toolbox",
    },
    {
      id: "canvas",
      title: "Build Area",
      description: "Drop components here to build your plant. Connect them from extraction → transport → processing → storage.",
      highlight: "canvas",
      icon: "canvas",
    },
    {
      id: "status",
      title: "Status & Progress",
      description: "Track your time and score here. Watch for fault indicators if something goes wrong!",
      highlight: "right-panel",
      icon: "status",
    },
    {
      id: "start",
      title: "Ready to Build!",
      description: "Use the rules and fault indicators to guide you. Good luck, Engineer!",
      highlight: null,
      icon: "start",
    },
  ];

  // Mobile-specific tutorial steps
  const MOBILE_TUTORIAL_STEPS = [
    {
      id: "welcome",
      title: "Oil & Gas Plant Builder",
      description: "Build the complete oil production chain by dragging components in the correct order.",
      highlight: null,
      icon: "welcome",
    },
    {
      id: "toolbar",
      title: "Component Toolbar",
      description: "Tap and drag components from the bottom toolbar onto the canvas.",
      highlight: "bottom-toolbar",
      icon: "toolbox",
    },
    {
      id: "canvas",
      title: "Drop Zone",
      description: "Drop components here. Connect them from extraction → transport → processing → storage.",
      highlight: "canvas",
      icon: "canvas",
    },
    {
      id: "start",
      title: "Let's Go!",
      description: "Use the rules and fault indicators to guide you. Good luck!",
      highlight: null,
      icon: "start",
    },
  ];

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Slot positions on canvas (responsive)
  const slotPositions = useMemo(() => {
    const slotSize = isMobile ? 42 : 100;
    const gap = isMobile ? 8 : 20;
    const sidebarWidth = isMobile ? 0 : 288 + 320 + 32;
    const availableWidth = windowWidth - sidebarWidth - 32;
    const totalWidth = CORRECT_SEQUENCE.length * slotSize + (CORRECT_SEQUENCE.length - 1) * gap;
    const startX = isMobile 
      ? (windowWidth - totalWidth) / 2 + slotSize / 2
      : (availableWidth - totalWidth) / 2 + slotSize / 2;
    
    // Calculate vertical center: header ~56px, toolbar ~120px, some padding
    const headerHeight = isMobile ? 56 : 72;
    const toolbarHeight = isMobile ? 140 : 0;
    const availableHeight = windowHeight - headerHeight - toolbarHeight - 32;
    const centerY = isMobile 
      ? headerHeight + (availableHeight - slotSize) / 2 + slotSize / 2 - 40
      : 280;
    
    return CORRECT_SEQUENCE.map((_, index) => ({
      x: Math.max(slotSize / 2 + 10, startX + index * (slotSize + gap)),
      y: centerY,
    }));
  }, [isMobile, windowWidth, windowHeight]);

  // Start session when component mounts (after tutorial is dismissed)
  useEffect(() => {
    const startSession = async () => {
      if (!userPhone || showTutorial) return;
      
      try {
        await fetch("/api/user/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: userPhone }),
        });
        console.log("Session started for:", userPhone);
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    };
    
    startSession();
  }, [userPhone, showTutorial]);

  // Save score to backend with local backup for data loss prevention
  const saveScoreToBackend = useCallback(async (finalScore: number, finalTimeLeft: number, slots: number) => {
    if (!userPhone) return false;
    
    const result = await saveScoreWithBackup({
      phone: userPhone,
      sector: userSector,
      score: finalScore,
      slots: slots,
      timeLeft: finalTimeLeft,
      completedAt: new Date().toISOString(),
    });
    
    if (result.success) {
      console.log("Score saved successfully", result.isNewHighScore ? "- New high score!" : "");
    } else {
      console.warn("Score backed up locally:", result.error);
    }
    return result.success;
  }, [userPhone, userSector]);

  // Timer - paused during tutorial
  useEffect(() => {
    if (!isActive || isComplete || timeLeft <= 0 || showTutorial) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isComplete, timeLeft, showTutorial]);

  // Handle time's up - save score and redirect after showing modal
  useEffect(() => {
    if (isTimeUp && !scoreSaved) {
      // Calculate partial score based on components placed
      const partialScore = Math.max(0, (placedComponents.length / CORRECT_SEQUENCE.length) * 5 - wrongAttempts * 0.5);
      
      // Save score without setting state in effect
      saveScoreToBackend(partialScore, 0, placedComponents.length).then((saved) => {
        if (saved) {
          setScoreSaved(true);
        }
      });
      
      const timer = setTimeout(() => {
        onExit?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isTimeUp, onExit, placedComponents, wrongAttempts, saveScoreToBackend, scoreSaved]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if component is next in sequence
  const isCorrectNext = useCallback((componentId: string) => {
    const placedIds = placedComponents.map(p => p.componentId);
    const nextIndex = placedIds.length;
    return CORRECT_SEQUENCE[nextIndex] === componentId;
  }, [placedComponents]);

  // Get error message for wrong placement
  const getErrorMessage = useCallback((componentId: string) => {
    const nextExpected = CORRECT_SEQUENCE[placedComponents.length];
    const messages: Record<string, string> = {
      reservoir: "Start with the Reservoir - this is where oil is discovered underground.",
      drilling: "The Drilling Rig comes after finding the reservoir. You need to know where to drill first!",
      platform: "The Platform is built after drilling confirms a viable oil field.",
      pipeline: "Pipeline transports crude oil from the platform to processing facilities.",
      separator: "The Separator processes crude oil after it arrives via pipeline.",
      storage: "Storage Tanks hold processed products before distribution.",
      tanker: "Tankers are the final step - they transport oil to markets.",
    };
    return messages[componentId] || `Place ${nextExpected} before ${componentId}.`;
  }, [placedComponents]);

  // Determine fault type based on wrong component
  const getFaultType = useCallback((attemptedComponent: string): string => {
    const nextExpected = CORRECT_SEQUENCE[placedComponents.length];
    const attemptedIndex = CORRECT_SEQUENCE.indexOf(attemptedComponent);
    const expectedIndex = placedComponents.length;
    
    // Order fault - component is out of sequence
    if (attemptedIndex > expectedIndex) {
      return "order";
    }
    // Missing part - trying to skip ahead
    if (attemptedIndex < expectedIndex && attemptedIndex !== -1) {
      return "missing";
    }
    // Wrong connection - component doesn't fit the current position
    if (attemptedComponent === "tanker" && nextExpected !== "tanker") {
      return "connection";
    }
    if (attemptedComponent === "separator" && nextExpected === "storage") {
      return "safety";
    }
    // Default to order fault
    return "order";
  }, [placedComponents]);

  // Handle drop on canvas
  const handleCanvasDrop = useCallback(() => {
    if (!draggingComponent) return;
    
    // Check sequence
    if (!isCorrectNext(draggingComponent)) {
      setWrongAttempts(prev => prev + 1);
      // Set the fault type
      const faultType = getFaultType(draggingComponent);
      setLastFault(faultType);
      setFaultComponent(draggingComponent);
      
      // Clear fault after 3 seconds
      setTimeout(() => {
        setLastFault(null);
        setFaultComponent(null);
      }, 3000);
      
      if (wrongAttempts >= 2) {
        setHintMessage(getErrorMessage(draggingComponent));
        setShowHint(true);
      }
      setDraggingComponent(null);
      return;
    }
    
    // Clear any previous fault on successful placement
    setLastFault(null);
    setFaultComponent(null);
    
    // Get next slot position
    const slotIndex = placedComponents.length;
    const slot = slotPositions[slotIndex];
    
    const newComponent: PlacedComponent = {
      id: `placed-${Date.now()}`,
      componentId: draggingComponent,
      x: slot.x,
      y: slot.y,
    };
    
    setPlacedComponents(prev => {
      const updated = [...prev, newComponent];
      
      // Check completion
      if (updated.length === CORRECT_SEQUENCE.length) {
        setIsComplete(true);
        const timeBonus = timeLeft > 0 ? Math.min(3, Math.floor(timeLeft / 50)) : 0;
        const finalScore = Math.min(10, Math.max(0, 7 + timeBonus - wrongAttempts * 0.5));
        
        // Save score to backend
        saveScoreToBackend(finalScore, timeLeft, updated.length).then((saved) => {
          if (saved) {
            setScoreSaved(true);
          }
        });
        
        onComplete?.(finalScore, timeLeft);
      }
      
      return updated;
    });
    
    setDraggingComponent(null);
    setWrongAttempts(0);
  }, [draggingComponent, isCorrectNext, wrongAttempts, getErrorMessage, getFaultType, placedComponents, slotPositions, timeLeft, onComplete, saveScoreToBackend]);

  // Drag handlers
  const handleDragStart = (componentId: string) => {
    const alreadyPlaced = placedComponents.some(p => p.componentId === componentId);
    if (alreadyPlaced) return;
    setDraggingComponent(componentId);
  };

  const handleDragEnd = () => {
    setDraggingComponent(null);
  };

  // Calculate score
  const score = useMemo(() => {
    const baseScore = placedComponents.length;
    const timeBonus = timeLeft > 0 ? Math.min(3, Math.floor(timeLeft / 50)) : 0;
    const penalty = wrongAttempts * 0.5;
    return Math.min(10, Math.max(0, baseScore + timeBonus - penalty));
  }, [placedComponents.length, wrongAttempts, timeLeft]);

  // Tutorial navigation
  const activeTutorialSteps = isMobile ? MOBILE_TUTORIAL_STEPS : TUTORIAL_STEPS;
  
  const handleNextTutorial = () => {
    if (tutorialStep < activeTutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
  };

  const currentTutorialStep = activeTutorialSteps[tutorialStep];

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col" style={{ background: COLORS.darkBlue }}>
      
      {/* MAIN HEADER */}
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="flex-shrink-0 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between relative z-20 gap-2"
        style={{ 
          background: COLORS.indigo,
          borderBottom: `2px solid ${COLORS.yellow}40`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Logo & Task Title */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div 
            className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ 
              background: COLORS.yellow,
              boxShadow: `0 4px 15px ${COLORS.yellow}40`,
            }}
          >
            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke={COLORS.darkBlue} strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-xl font-bold tracking-wide" style={{ color: COLORS.yellow }}>
              Oil & Gas Plant Builder
            </h1>
            <p className="text-[10px] md:text-xs flex items-center gap-2" style={{ color: `${COLORS.white}70` }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Engineer: <strong style={{ color: COLORS.white }}>{userName}</strong>
            </p>
          </div>
        </div>

        {/* Task Badge - Hidden on mobile, shown on tablet+ */}
        <div 
          className="hidden lg:flex px-4 py-2 rounded-lg items-center gap-3 flex-shrink-0"
          style={{ 
            background: `${COLORS.blue}30`,
            border: `1px solid ${COLORS.blue}50`,
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill={COLORS.yellow} viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <div>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: `${COLORS.white}60` }}>Current Task</p>
            <p className="text-xs font-semibold leading-tight" style={{ color: COLORS.white }}>Identify Upstream, Midstream & Downstream</p>
          </div>
        </div>

        {/* Mobile: Timer, Score & Progress inline */}
        {isMobile && (
          <div className="flex items-center gap-3 flex-1 justify-center">
            {/* Progress indicator */}
            <div className="flex items-center gap-1">
              {CORRECT_SEQUENCE.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i < placedComponents.length ? COLORS.yellow : `${COLORS.white}30`,
                    transform: i === placedComponents.length ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <div 
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: timeLeft <= 30 ? `${COLORS.yellow}30` : `${COLORS.indigo}80` }}
            >
              <svg className="w-4 h-4" fill="none" stroke={COLORS.yellow} strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              <span className="font-mono text-base font-bold" style={{ color: COLORS.yellow }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: `${COLORS.indigo}80` }}>
              <svg className="w-4 h-4" fill={COLORS.yellow} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-base font-bold" style={{ color: COLORS.yellow }}>{score.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Help Button */}
        <button
          onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
          className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-all hover:scale-105 flex-shrink-0"
          style={{ 
            background: `${COLORS.yellow}20`,
            border: `1px solid ${COLORS.yellow}40`,
          }}
        >
          <svg className="w-4 h-4" fill={COLORS.yellow} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
          <span className="text-xs md:text-sm font-medium hidden sm:inline" style={{ color: COLORS.yellow }}>Help</span>
        </button>
      </motion.header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
        
        {/* LEFT PANEL - Toolbox (Hidden on mobile) */}
        <motion.div 
          data-tutorial-id="left-panel"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="hidden md:flex w-72 flex-col flex-shrink-0 rounded-2xl overflow-hidden relative z-10"
          style={{ 
            background: COLORS.indigo,
            border: `2px solid ${COLORS.yellow}25`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 ${COLORS.white}10`,
          }}
        >
          {/* Toolbox Header */}
          <div 
            className="p-4 flex items-center gap-3"
            style={{ 
              background: `${COLORS.yellow}15`,
              borderBottom: `1px solid ${COLORS.yellow}20`,
            }}
          >
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: COLORS.yellow,
                boxShadow: `0 4px 12px ${COLORS.yellow}30`,
              }}
            >
              <svg className="w-6 h-6" fill={COLORS.darkBlue} viewBox="0 0 24 24">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: COLORS.yellow }}>Toolbox</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.white}60` }}>Drag components to canvas</p>
            </div>
          </div>

          {/* Component List */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {shuffledComponents.map((comp, index) => {
              const isPlaced = placedComponents.some(p => p.componentId === comp.id);
              const isNext = isCorrectNext(comp.id);
              const isDragging = draggingComponent === comp.id;
            
            return (
              <motion.div
                key={comp.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                draggable={!isPlaced}
                onDragStart={() => handleDragStart(comp.id)}
                onDragEnd={handleDragEnd}
                className={`
                  relative p-3 rounded-xl cursor-grab active:cursor-grabbing
                  transition-all duration-200 flex items-center gap-3 group
                  ${isPlaced ? "cursor-default opacity-50" : "hover:translate-x-1 hover:shadow-lg"}
                  ${isDragging ? "scale-105 z-50" : ""}
                `}
                style={{ 
                  background: isPlaced 
                    ? `${COLORS.yellow}15`
                    : isDragging 
                      ? `${COLORS.yellow}25`
                      : `${COLORS.white}08`,
                  border: `1px solid ${
                    isPlaced ? `${COLORS.yellow}50` 
                    : isDragging ? COLORS.yellow 
                    : isNext && wrongAttempts >= 3 ? `${COLORS.yellow}80`
                    : `${COLORS.white}15`
                  }`,
                  boxShadow: isDragging ? `0 8px 25px ${COLORS.yellow}30` : "none",
                }}
              >
                {/* Component Icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: isPlaced 
                      ? COLORS.yellow
                      : COLORS.blue,
                  }}
                >
                  {isPlaced ? (
                    <svg className="w-5 h-5" fill="none" stroke={COLORS.white} strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <ComponentIcon componentId={comp.id} size={26} />
                  )}
                </div>

                {/* Component Info */}
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-semibold truncate"
                    style={{ color: isPlaced ? COLORS.yellow : COLORS.white }}
                  >
                    {comp.name}
                  </p>
                  <p className="text-[10px]" style={{ color: `${COLORS.white}50` }}>
                    {isPlaced ? "✓ Placed" : "Drag to canvas"}
                  </p>
                </div>

                {/* Drag indicator */}
                {!isPlaced && (
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `${COLORS.white}10`,
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke={`${COLORS.white}50`} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
          </div>
        </motion.div>

        {/* CENTER PANEL - Canvas Workspace */}
        <div 
          data-tutorial-id="canvas"
          className="flex-1 flex flex-col rounded-2xl overflow-hidden relative pb-24 md:pb-0"
          style={{ 
            background: `${COLORS.indigo}60`,
            border: `2px solid ${COLORS.blue}40`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.4), inset 0 0 100px ${COLORS.blue}10`,
          }}
        >
          {/* Canvas Area */}
          <div 
            ref={canvasRef}
            className="flex-1 relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleCanvasDrop();
            }}
          >
            {/* Ocean background */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={COLORS.indigo} />
                  <stop offset="40%" stopColor={COLORS.blue} />
                  <stop offset="100%" stopColor={COLORS.oceanDark} />
                </linearGradient>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a4a" />
                  <stop offset="50%" stopColor="#2E3093" />
                  <stop offset="100%" stopColor="#2A6BB5" />
                </linearGradient>
              </defs>
              {/* Sky */}
              <rect x="0" y="0" width="100%" height="45%" fill="url(#skyGradient)" />
              {/* Ocean */}
              <rect x="0" y="45%" width="100%" height="55%" fill="url(#oceanGradient)" />
              {/* Horizon line */}
              <line x1="0" y1="45%" x2="100%" y2="45%" stroke={COLORS.oceanLight} strokeWidth="2" opacity="0.5" />
              {/* Animated waves */}
              <g>
                <path 
                  d="M0,380 Q100,365 200,380 T400,380 T600,380 T800,380 T1000,380 T1200,380 T1400,380 T1600,380 T1800,380 T2000,380" 
                  stroke={COLORS.oceanLight} 
                  strokeWidth="3" 
                  fill="none" 
                  opacity="0.4"
                >
                  <animate attributeName="d" dur="4s" repeatCount="indefinite"
                    values="M0,380 Q100,365 200,380 T400,380 T600,380 T800,380 T1000,380 T1200,380 T1400,380 T1600,380 T1800,380 T2000,380;
                            M0,380 Q100,395 200,380 T400,380 T600,380 T800,380 T1000,380 T1200,380 T1400,380 T1600,380 T1800,380 T2000,380;
                            M0,380 Q100,365 200,380 T400,380 T600,380 T800,380 T1000,380 T1200,380 T1400,380 T1600,380 T1800,380 T2000,380" />
                </path>
              </g>
            </svg>

            {/* Free drop zone indicator */}
            {placedComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="px-6 py-3 rounded-xl border-2 border-dashed"
                  style={{ 
                    borderColor: `${COLORS.yellow}50`,
                    background: `${COLORS.yellow}10`,
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: `${COLORS.yellow}90` }}>
                    Drop components here
                  </p>
                </div>
              </div>
            )}

            {/* Fault Type Legend - shown on canvas */}
            <div 
              className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} pointer-events-none z-20`}
            >
              <div 
                className={`${isMobile ? 'p-2' : 'p-3'} rounded-xl`}
                style={{ 
                  background: `${COLORS.indigo}95`,
                  border: `1px solid ${COLORS.white}15`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <p className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold mb-1.5`} style={{ color: COLORS.yellow }}>
                  Fault Types
                </p>
                <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <span className={`text-red-400 ${isMobile ? 'text-[8px]' : 'text-xs'}`}>→→</span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: lastFault === 'order' ? '#ef4444' : `${COLORS.white}80` }}>Order</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <span className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded border border-dashed`} style={{ borderColor: COLORS.yellow }}></span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: lastFault === 'missing' ? COLORS.yellow : `${COLORS.white}80` }}>Missing</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <svg className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                    </svg>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: lastFault === 'connection' ? '#ef4444' : `${COLORS.white}80` }}>Connection</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <svg className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} fill="#fbbf24" viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: lastFault === 'safety' ? '#fbbf24' : `${COLORS.white}80` }}>Safety</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <div className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded flex items-center justify-center`} style={{ background: '#3b82f6' }}>
                      <span className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-white font-bold`}>i</span>
                    </div>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: lastFault === 'efficiency' ? '#3b82f6' : `${COLORS.white}80` }}>Efficiency</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Fault Indicator - animated popup when fault occurs */}
            <AnimatePresence>
              {lastFault && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-30`}
                >
                  <div 
                    className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} rounded-xl flex items-center gap-2`}
                    style={{ 
                      background: lastFault === 'order' ? '#ef444420' 
                        : lastFault === 'missing' ? `${COLORS.yellow}20`
                        : lastFault === 'connection' ? '#ef444420'
                        : lastFault === 'safety' ? '#fbbf2420'
                        : '#3b82f620',
                      border: `2px solid ${
                        lastFault === 'order' ? '#ef4444' 
                        : lastFault === 'missing' ? COLORS.yellow
                        : lastFault === 'connection' ? '#ef4444'
                        : lastFault === 'safety' ? '#fbbf24'
                        : '#3b82f6'
                      }`,
                      boxShadow: `0 4px 20px ${
                        lastFault === 'order' ? '#ef444440' 
                        : lastFault === 'missing' ? `${COLORS.yellow}40`
                        : lastFault === 'connection' ? '#ef444440'
                        : lastFault === 'safety' ? '#fbbf2440'
                        : '#3b82f640'
                      }`,
                    }}
                  >
                    {/* Fault Icon */}
                    {lastFault === 'order' && (
                      <span className={`${isMobile ? 'text-base' : 'text-lg'} text-red-400`}>→→</span>
                    )}
                    {lastFault === 'missing' && (
                      <motion.span 
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} rounded border-2 border-dashed`} 
                        style={{ borderColor: COLORS.yellow }}
                      />
                    )}
                    {lastFault === 'connection' && (
                      <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                      </svg>
                    )}
                    {lastFault === 'safety' && (
                      <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="#fbbf24" viewBox="0 0 24 24">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                      </svg>
                    )}
                    {lastFault === 'efficiency' && (
                      <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} rounded-full flex items-center justify-center`} style={{ background: '#3b82f6' }}>
                        <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-white font-bold`}>i</span>
                      </div>
                    )}
                    
                    {/* Fault Text */}
                    <div>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold`} style={{ 
                        color: lastFault === 'order' ? '#ef4444' 
                          : lastFault === 'missing' ? COLORS.yellow
                          : lastFault === 'connection' ? '#ef4444'
                          : lastFault === 'safety' ? '#fbbf24'
                          : '#3b82f6'
                      }}>
                        {lastFault === 'order' && 'Order Fault'}
                        {lastFault === 'missing' && 'Missing Part'}
                        {lastFault === 'connection' && 'Wrong Connection'}
                        {lastFault === 'safety' && 'Safety Fault'}
                        {lastFault === 'efficiency' && 'Efficiency Issue'}
                      </p>
                      {faultComponent && (
                        <p className={`${isMobile ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: `${COLORS.white}70` }}>
                          {COMPONENTS.find(c => c.id === faultComponent)?.name}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

        {/* Placed components */}
        {placedComponents.map((comp) => {
          const compSize = isMobile ? 42 : 100;
          return (
            <motion.div
              key={comp.id}
              className="absolute"
              style={{
                left: comp.x - compSize / 2,
                top: comp.y - compSize / 2,
              }}
              initial={{ scale: 0, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <ComponentIcon componentId={comp.componentId} size={compSize} />
            </motion.div>
          );
        })}

        {/* Connection pipes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          {placedComponents.slice(1).map((comp, index) => {
            const prevComp = placedComponents[index];
            const pipeOffset = isMobile ? 18 : 40;
            return (
              <g key={comp.id}>
                {/* Pipe */}
                <line
                  x1={prevComp.x + pipeOffset}
                  y1={prevComp.y}
                  x2={comp.x - pipeOffset}
                  y2={comp.y}
                  stroke={COLORS.steel}
                  strokeWidth={isMobile ? 3 : 8}
                  strokeLinecap="round"
                />
                {/* Animated flow */}
                <circle r={isMobile ? 2 : 4} fill={COLORS.yellow}>
                  <animate
                    attributeName="cx"
                    from={prevComp.x + pipeOffset}
                    to={comp.x - pipeOffset}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    from={prevComp.y}
                    to={comp.y}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL - Status & Toolbox (Hidden on mobile) */}
        <motion.div 
          data-tutorial-id="right-panel"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="hidden md:flex w-80 flex-col flex-shrink-0 rounded-2xl overflow-hidden relative z-10"
          style={{ 
            background: COLORS.indigo,
            border: `2px solid ${COLORS.yellow}25`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 ${COLORS.white}10`,
          }}
        >
          {/* Status Header */}
          <div 
            className="p-4 flex items-center gap-3"
            style={{ 
              background: `${COLORS.yellow}15`,
              borderBottom: `1px solid ${COLORS.yellow}20`,
            }}
          >
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: COLORS.yellow,
                boxShadow: `0 4px 12px ${COLORS.yellow}30`,
              }}
            >
              <svg className="w-6 h-6" fill={COLORS.white} viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: COLORS.yellow }}>Status Panel</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.white}60` }}>Track your progress</p>
            </div>
          </div>

          {/* Timer & Score */}
          <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.white}10` }}>
            <div className="flex gap-3">
              {/* Timer */}
              <motion.div
                animate={{ scale: timeLeft <= 30 ? [1, 1.02, 1] : 1 }}
                transition={{ repeat: timeLeft <= 30 ? Infinity : 0, duration: 0.5 }}
                className="flex-1 p-4 rounded-xl text-center"
                style={{ 
                  background: timeLeft <= 30 
                    ? `${COLORS.yellow}20` 
                    : COLORS.blue,
                  border: `2px solid ${COLORS.yellow}40`,
                  boxShadow: timeLeft <= 30 ? `0 0 20px ${COLORS.yellow}30` : `0 4px 15px rgba(0,0,0,0.2)`,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke={COLORS.yellow} strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-xs uppercase font-bold tracking-wider" style={{ color: COLORS.yellow }}>Time</span>
                </div>
                <span className="font-mono text-3xl font-bold" style={{ color: COLORS.yellow }}>
                  {formatTime(timeLeft)}
                </span>
              </motion.div>

              {/* Score */}
              <div 
                className="flex-1 p-4 rounded-xl text-center"
                style={{ 
                  background: COLORS.blue,
                  border: `2px solid ${COLORS.yellow}40`,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.2)`,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill={COLORS.yellow} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs uppercase font-bold tracking-wider" style={{ color: COLORS.yellow }}>Score</span>
                </div>
                <span className="text-3xl font-bold" style={{ color: COLORS.yellow }}>{score.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-4 py-4" style={{ borderBottom: `1px solid ${COLORS.white}10` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: COLORS.white }}>Progress</span>
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${COLORS.yellow}20`, color: COLORS.yellow }}>
                {placedComponents.length} / {CORRECT_SEQUENCE.length}
              </span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ background: `${COLORS.white}15` }}>
              <motion.div 
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(placedComponents.length / CORRECT_SEQUENCE.length) * 100}%` }}
                transition={{ type: "spring", damping: 15 }}
                style={{ 
                  background: COLORS.yellow,
                  boxShadow: `0 0 10px ${COLORS.yellow}50`,
                }}
              />
            </div>
          </div>

          {/* System Feedback / Hints Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: `${COLORS.blue}10`, borderBottom: `1px solid ${COLORS.white}10` }}>
              <svg className="w-5 h-5" fill={COLORS.yellow} viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.yellow }}>System Log</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {/* Initial message */}
              <div className="p-3 rounded-xl" style={{ background: `${COLORS.blue}20`, border: `1px solid ${COLORS.blue}40` }}>
                <p className="text-xs" style={{ color: `${COLORS.white}90` }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: COLORS.blue }}></span>
                  System initialized. Place components to build your plant.
                </p>
              </div>

              {/* Placed components log */}
              {placedComponents.map((comp, index) => {
                const compData = COMPONENTS.find(c => c.id === comp.componentId);
                return (
                  <motion.div 
                    key={comp.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl"
                    style={{ background: `${COLORS.yellow}20`, border: `1px solid ${COLORS.yellow}40` }}
                  >
                    <p className="text-xs" style={{ color: `${COLORS.white}90` }}>
                      <span style={{ color: COLORS.yellow }}>✓</span> {compData?.name} connected at position {index + 1}
                    </p>
                  </motion.div>
                );
              })}

              {/* Wrong attempt hint */}
              {wrongAttempts > 0 && !showHint && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl"
                  style={{ background: `${COLORS.blue}20`, border: `1px solid ${COLORS.blue}40` }}
                >
                  <p className="text-xs" style={{ color: `${COLORS.white}90` }}>
                    <span style={{ color: COLORS.yellow }}>⚠</span> Wrong sequence! {wrongAttempts >= 2 ? "Hint available." : "Try again."}
                  </p>
                </motion.div>
              )}

              {/* Completion message */}
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl"
                  style={{ background: `${COLORS.yellow}25`, border: `1px solid ${COLORS.yellow}60` }}
                >
                  <p className="text-xs font-medium" style={{ color: COLORS.yellow }}>
                    Plant complete! All systems operational.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Exit hint */}
          <div 
            className="px-4 py-3 flex items-center justify-center gap-2"
            style={{ background: `${COLORS.darkBlue}80`, borderTop: `1px solid ${COLORS.white}10` }}
          >
            <kbd className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: `${COLORS.white}15`, color: `${COLORS.white}70` }}>ESC</kbd>
            <span className="text-[11px]" style={{ color: `${COLORS.white}50` }}>to exit</span>
          </div>
        </motion.div>

        {/* MOBILE BOTTOM TOOLBAR */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 20 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{ 
            background: COLORS.indigo,
            borderTop: `2px solid ${COLORS.yellow}50`,
            boxShadow: `0 -10px 50px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="px-4 py-5">
            {/* Single line: Label + Components in a row */}
            <div className="flex items-center gap-4">
              <p className="text-base font-bold flex-shrink-0" style={{ color: COLORS.yellow }}>
                🛠️
              </p>
              <div className="flex items-center gap-4 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {shuffledComponents.map((comp) => {
                  const isPlaced = placedComponents.some((p) => p.componentId === comp.id);
                  return (
                    <motion.div
                      key={comp.id}
                      draggable={!isPlaced && !isComplete}
                      onDragStart={() => handleDragStart(comp.id)}
                      whileTap={{ scale: isPlaced ? 1 : 0.9 }}
                      className={`relative flex-shrink-0 flex flex-col items-center p-2.5 rounded-2xl transition-all ${
                        isPlaced ? 'opacity-40' : 'cursor-grab active:cursor-grabbing'
                      }`}
                      style={{ 
                        background: isPlaced ? `${COLORS.white}05` : `${COLORS.white}12`,
                        border: `2px solid ${isPlaced ? `${COLORS.white}15` : `${COLORS.yellow}50`}`,
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ 
                          background: isPlaced ? `${COLORS.white}10` : COLORS.blue,
                        }}
                      >
                        {isPlaced ? (
                          <svg className="w-7 h-7" fill={COLORS.yellow} viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        ) : (
                          <ComponentIcon componentId={comp.id} size={36} />
                        )}
                      </div>
                      <span 
                        className="text-xs font-bold text-center leading-tight mt-2 w-16"
                        style={{ color: isPlaced ? `${COLORS.white}40` : COLORS.white }}
                      >
                        {comp.name.split(' ')[0]}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-base font-bold flex-shrink-0 px-4 py-2 rounded-xl" style={{ color: COLORS.yellow, background: `${COLORS.yellow}20` }}>
                {placedComponents.length}/{CORRECT_SEQUENCE.length}
              </p>
            </div>
          </div>
          {/* Safe area padding for notched phones */}
          <div className="h-[env(safe-area-inset-bottom)]" style={{ background: COLORS.indigo }} />
        </motion.div>
      </div>

      {/* TUTORIAL OVERLAY */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Dark overlay - covers entire screen */}
            <div className="absolute inset-0 bg-black/90" />

            {/* Highlighted cutout window - hidden on mobile */}
            {currentTutorialStep.highlight && !isMobile && (
              <motion.div
                key={`highlight-${currentTutorialStep.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute overflow-hidden"
                style={{
                  ...(currentTutorialStep.highlight === "left-panel" ? { 
                    left: 16, 
                    top: 76,
                    width: 288, 
                    bottom: 16,
                  } : {}),
                  ...(currentTutorialStep.highlight === "canvas" ? { 
                    left: 320,
                    top: 76,
                    right: 352,
                    bottom: 16,
                  } : {}),
                  ...(currentTutorialStep.highlight === "right-panel" ? { 
                    right: 16, 
                    top: 76, 
                    width: 320, 
                    bottom: 16,
                  } : {}),
                  borderRadius: 16,
                  border: `4px solid ${COLORS.yellow}`,
                  boxShadow: `0 0 60px ${COLORS.yellow}80, 0 0 120px ${COLORS.yellow}40, inset 0 0 60px ${COLORS.yellow}20`,
                  background: COLORS.indigo,
                }}
              >
                {/* Re-render the actual panel content inside the highlight */}
                {currentTutorialStep.highlight === "left-panel" && (
                  <div className="w-full h-full flex flex-col" style={{ background: COLORS.indigo }}>
                    <div className="p-4 flex items-center gap-3" style={{ background: `${COLORS.yellow}15`, borderBottom: `1px solid ${COLORS.yellow}20` }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: COLORS.yellow }}>
                        <svg className="w-6 h-6" fill={COLORS.darkBlue} viewBox="0 0 24 24">
                          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-base font-bold" style={{ color: COLORS.yellow }}>Toolbox</h2>
                        <p className="text-[11px]" style={{ color: `${COLORS.white}60` }}>Drag components to canvas</p>
                      </div>
                    </div>
                    <div className="flex-1 p-3 flex flex-col gap-2">
                      {COMPONENTS.slice(0, 4).map((comp) => (
                        <div key={comp.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: `${COLORS.white}08`, border: `1px solid ${COLORS.white}15` }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: COLORS.blue }}>
                            <ComponentIcon componentId={comp.id} size={26} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: COLORS.white }}>{comp.name}</p>
                            <p className="text-[10px]" style={{ color: `${COLORS.white}50` }}>Drag to canvas</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentTutorialStep.highlight === "canvas" && (
                  <div className="w-full h-full relative" style={{ background: `${COLORS.indigo}60` }}>
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="tutorialSkyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1a1a4a" />
                          <stop offset="50%" stopColor="#2E3093" />
                          <stop offset="100%" stopColor="#2A6BB5" />
                        </linearGradient>
                        <linearGradient id="tutorialOceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={COLORS.indigo} />
                          <stop offset="40%" stopColor={COLORS.blue} />
                          <stop offset="100%" stopColor={COLORS.oceanDark} />
                        </linearGradient>
                      </defs>
                      <rect x="0" y="0" width="100%" height="45%" fill="url(#tutorialSkyGradient)" />
                      <rect x="0" y="45%" width="100%" height="55%" fill="url(#tutorialOceanGradient)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: i === 1 ? COLORS.yellow : `${COLORS.white}30`, background: i === 1 ? `${COLORS.yellow}10` : `${COLORS.white}05` }}>
                            <span className="text-xs font-bold opacity-50" style={{ color: COLORS.white }}>{i}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentTutorialStep.highlight === "right-panel" && (
                  <div className="w-full h-full flex flex-col" style={{ background: COLORS.indigo }}>
                    <div className="p-4 flex items-center gap-3" style={{ background: `${COLORS.yellow}15`, borderBottom: `1px solid ${COLORS.yellow}20` }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: COLORS.yellow }}>
                        <svg className="w-6 h-6" fill={COLORS.white} viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-base font-bold" style={{ color: COLORS.yellow }}>Status Panel</h2>
                        <p className="text-[11px]" style={{ color: `${COLORS.white}60` }}>Track your progress</p>
                      </div>
                    </div>
                    <div className="p-4 flex gap-3">
                      <div className="flex-1 p-4 rounded-xl text-center" style={{ background: COLORS.blue, border: `2px solid ${COLORS.yellow}40` }}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <svg className="w-5 h-5" fill="none" stroke={COLORS.yellow} strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <path strokeLinecap="round" d="M12 6v6l4 2" />
                          </svg>
                          <span className="text-xs uppercase font-bold" style={{ color: COLORS.yellow }}>Time</span>
                        </div>
                        <span className="font-mono text-2xl font-bold" style={{ color: COLORS.yellow }}>2:30</span>
                      </div>
                      <div className="flex-1 p-4 rounded-xl text-center" style={{ background: COLORS.blue, border: `2px solid ${COLORS.yellow}40` }}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <svg className="w-5 h-5" fill={COLORS.yellow} viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-xs uppercase font-bold" style={{ color: COLORS.yellow }}>Score</span>
                        </div>
                        <span className="text-2xl font-bold" style={{ color: COLORS.yellow }}>0.0</span>
                      </div>
                    </div>
                    <div className="px-4 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold" style={{ color: COLORS.white }}>Progress</span>
                        <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${COLORS.yellow}20`, color: COLORS.yellow }}>0 / 7</span>
                      </div>
                      <div className="w-full h-4 rounded-full" style={{ background: `${COLORS.white}15` }} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* MOBILE TUTORIAL */}
            {isMobile && (
              <motion.div
                key={`mobile-${tutorialStep}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative z-20 w-full max-w-sm mx-auto flex flex-col"
              >
                {/* Mobile highlight areas */}
                {currentTutorialStep.highlight === "bottom-toolbar" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none"
                    style={{
                      borderTop: `3px solid ${COLORS.yellow}`,
                      boxShadow: `0 -20px 60px ${COLORS.yellow}60`,
                      height: 100,
                      background: `${COLORS.indigo}95`,
                    }}
                  >
                    <div className="px-3 py-2 text-center">
                      <p className="text-[10px] font-semibold" style={{ color: COLORS.yellow }}>
                        ↑ Drag components from here ↑
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentTutorialStep.highlight === "canvas" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed left-4 right-4 top-16 bottom-28 z-10 pointer-events-none rounded-2xl"
                    style={{
                      border: `3px solid ${COLORS.yellow}`,
                      boxShadow: `0 0 40px ${COLORS.yellow}50, inset 0 0 40px ${COLORS.yellow}10`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm font-medium px-4 py-2 rounded-lg" style={{ background: `${COLORS.yellow}20`, color: COLORS.yellow }}>
                        Drop Zone
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Tutorial Card */}
                <div 
                  className="rounded-2xl p-4 text-center max-h-[80vh] overflow-y-auto"
                  style={{ 
                    background: COLORS.indigo,
                    border: `3px solid ${COLORS.yellow}`,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
                  }}
                >
                  {/* Step dots */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {MOBILE_TUTORIAL_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          background: i === tutorialStep ? COLORS.yellow : i < tutorialStep ? COLORS.blue : `${COLORS.white}30`,
                          transform: i === tutorialStep ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold mb-2" style={{ color: COLORS.yellow }}>
                    {currentTutorialStep.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs leading-relaxed mb-3" style={{ color: `${COLORS.white}dd` }}>
                    {currentTutorialStep.description}
                  </p>

                  {/* Show fault types and rules only on welcome and final step */}
                  {(tutorialStep === 0 || tutorialStep === MOBILE_TUTORIAL_STEPS.length - 1) && (
                    <>
                      {/* Fault Types Reference */}
                      <div className="mb-3 p-2.5 rounded-xl text-left" style={{ background: `${COLORS.white}08`, border: `1px solid ${COLORS.white}15` }}>
                    <h3 className="text-xs font-bold mb-2" style={{ color: COLORS.yellow }}>Fault Types</h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-400 text-xs">→→</span>
                        <span style={{ color: COLORS.white }}>Order Fault</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded border border-dashed animate-pulse" style={{ borderColor: COLORS.yellow }}></span>
                        <span style={{ color: COLORS.white }}>Missing Part</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                        </svg>
                        <span style={{ color: COLORS.white }}>Wrong Connection</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="#fbbf24" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        <span style={{ color: COLORS.white }}>Safety Fault</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <div className="w-3 h-3 rounded flex items-center justify-center" style={{ background: '#3b82f6' }}>
                          <span className="text-[6px] text-white font-bold">i</span>
                        </div>
                        <span style={{ color: COLORS.white }}>Efficiency Issue</span>
                      </div>
                    </div>
                  </div>
                    </>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSkipTutorial}
                      className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm"
                      style={{ color: `${COLORS.white}80`, border: `1px solid ${COLORS.white}30` }}
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleNextTutorial}
                      className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                      style={{ background: COLORS.yellow, color: COLORS.darkBlue }}
                    >
                      {tutorialStep === MOBILE_TUTORIAL_STEPS.length - 1 ? "Start!" : "Next"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DESKTOP TUTORIAL */}
            {!isMobile && (
              <motion.div
              key={tutorialStep}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative z-20 p-8 rounded-2xl max-w-lg mx-4 text-center"
              style={{ 
                background: COLORS.indigo,
                border: `3px solid ${COLORS.yellow}`,
                boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.white}10`,
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      background: i === tutorialStep ? COLORS.yellow : i < tutorialStep ? COLORS.blue : `${COLORS.white}30`,
                      transform: i === tutorialStep ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.yellow }}>
                {currentTutorialStep.title}
              </h2>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: `${COLORS.white}e0` }}>
                {currentTutorialStep.description}
              </p>

              {/* Show fault types and rules only on welcome and final step */}
              {(tutorialStep === 0 || tutorialStep === TUTORIAL_STEPS.length - 1) && (
                <>
                  {/* Fault Types Reference */}
                  <div className="mb-4 p-3 rounded-xl text-left" style={{ background: `${COLORS.white}08`, border: `1px solid ${COLORS.white}15` }}>
                    <h3 className="text-sm font-bold mb-2" style={{ color: COLORS.yellow }}>Fault Types</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">→→</span>
                        <span style={{ color: COLORS.white }}>Order Fault</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border-2 border-dashed animate-pulse" style={{ borderColor: COLORS.yellow }}></span>
                        <span style={{ color: COLORS.white }}>Missing Part</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                        </svg>
                        <span style={{ color: COLORS.white }}>Wrong Connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="#fbbf24" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        <span style={{ color: COLORS.white }}>Safety Fault</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#3b82f6' }}>
                          <span className="text-[8px] text-white font-bold">i</span>
                        </div>
                        <span style={{ color: COLORS.white }}>Efficiency Issue</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleSkipTutorial}
                  className="px-5 py-2.5 rounded-xl font-medium transition-all hover:bg-white/10"
                  style={{ color: `${COLORS.white}80`, border: `1px solid ${COLORS.white}30` }}
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={handleNextTutorial}
                  className="px-6 py-2.5 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                  style={{ 
                    background: COLORS.yellow,
                    color: COLORS.darkBlue,
                    boxShadow: `0 4px 15px ${COLORS.yellow}40`,
                  }}
                >
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? "Start Building!" : "Next"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowHint(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="p-6 rounded-xl max-w-md text-center"
              style={{ 
                background: COLORS.indigo,
                border: `3px solid ${COLORS.yellow}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${COLORS.yellow}20` }}>
                <svg className="w-8 h-8" fill={COLORS.yellow} viewBox="0 0 24 24">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.yellow }}>
                Hint
              </h3>
              <p className="text-base mb-4" style={{ color: COLORS.white }}>
                {hintMessage}
              </p>
              <button
                onClick={() => setShowHint(false)}
                className="px-6 py-2 rounded-lg font-bold transition-transform hover:scale-105"
                style={{ background: COLORS.yellow, color: COLORS.indigo }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="p-8 rounded-2xl text-center max-w-md"
              style={{ 
                background: COLORS.indigo,
                border: `4px solid ${COLORS.yellow}`,
              }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${COLORS.yellow}30` }}>
                <svg className="w-12 h-12" fill="none" stroke={COLORS.yellow} strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.yellow }}>
                Plant Complete!
              </h2>
              <p className="text-lg mb-4" style={{ color: COLORS.white }}>
                You built a complete Oil & Gas production system!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg" style={{ background: `${COLORS.blue}50` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.yellow }}>
                    {score.toFixed(1)}/10
                  </div>
                  <div className="text-sm" style={{ color: COLORS.white }}>Final Score</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: `${COLORS.blue}50` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.yellow }}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.white }}>Time Left</div>
                </div>
              </div>
              <button
                onClick={() => setShowThankYou(true)}
                className="w-full px-8 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105"
                style={{ background: COLORS.yellow, color: COLORS.indigo }}
              >
                Continue →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THANK YOU OVERLAY */}
      <ThankYouOverlay
        isVisible={showThankYou}
        userName={userName}
        score={score}
        grade={score >= 9 ? "A+" : score >= 8 ? "A" : score >= 7 ? "B+" : score >= 6 ? "B" : score >= 5 ? "C" : "D"}
        sector={userSector}
        onComplete={() => onExit?.()}
      />

      {/* Time's Up Modal */}
      <AnimatePresence>
        {isTimeUp && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.85)" }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="p-10 rounded-2xl text-center max-w-md"
              style={{ 
                background: COLORS.indigo,
                border: `4px solid ${COLORS.yellow}`,
                boxShadow: `0 0 60px ${COLORS.yellow}40`,
              }}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: `${COLORS.yellow}30` }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <svg className="w-14 h-14" fill="none" stroke={COLORS.yellow} strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
              </motion.div>
              <motion.h2 
                className="text-4xl font-bold mb-3"
                style={{ color: COLORS.yellow }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                Time&apos;s Up!
              </motion.h2>
              <p className="text-lg mb-6" style={{ color: COLORS.white }}>
                You placed {placedComponents.length} of {CORRECT_SEQUENCE.length} components
              </p>
              <div className="p-4 rounded-lg mb-6" style={{ background: `${COLORS.blue}30` }}>
                <div className="text-3xl font-bold" style={{ color: COLORS.yellow }}>
                  {score.toFixed(1)}/10
                </div>
                <div className="text-sm" style={{ color: COLORS.white }}>Your Score</div>
              </div>
              <p className="text-sm opacity-60" style={{ color: COLORS.white }}>
                Redirecting to dashboard...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
