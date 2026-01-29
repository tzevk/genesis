"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThankYouOverlay from "./ThankYouOverlay";
import { saveScoreWithBackup } from "@/lib/utils";

// Distillation Process Color Palette
const COLORS = {
  skyBlue: "#3B82F6",
  lightBlue: "#60A5FA",
  deepBlue: "#1E3A8A",
  darkBlue: "#0F172A",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  white: "#F0F9FF",
  glass: "rgba(255, 255, 255, 0.08)",
  glassLight: "rgba(255, 255, 255, 0.12)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
  vapor: "#93C5FD",
  liquid: "#2563EB",
  heat: "#F97316",
  green: "#22C55E",
  red: "#EF4444",
};

// Distillation system structure with slots
const DISTILLATION_SYSTEM = {
  column: {
    name: "Distillation Column",
    slots: [
      { id: "column-1", componentId: "distillation-column", label: "Column" },
    ],
  },
  overhead: {
    name: "Overhead System",
    slots: [
      { id: "overhead-1", componentId: "condenser", label: "Condenser" },
      { id: "overhead-2", componentId: "reflux-drum", label: "Reflux Drum" },
      { id: "overhead-3", componentId: "reflux-pump", label: "Pump" },
    ],
  },
  bottoms: {
    name: "Bottoms System",
    slots: [
      { id: "bottoms-1", componentId: "kettle-reboiler", label: "Reboiler" },
    ],
  },
};

// Process Components
const COMPONENTS = [
  { id: "distillation-column", name: "Distillation Column", section: "column", description: "Separation vessel" },
  { id: "condenser", name: "Condenser", section: "overhead", description: "Cools overhead vapor" },
  { id: "reflux-drum", name: "Reflux Drum", section: "overhead", description: "Collects condensate" },
  { id: "reflux-pump", name: "Reflux Pump", section: "overhead", description: "Circulates reflux" },
  { id: "kettle-reboiler", name: "Kettle Reboiler", section: "bottoms", description: "Provides heat input" },
];

// Correct installation sequence
const CORRECT_SEQUENCE = [
  "distillation-column",
  "condenser",
  "reflux-drum",
  "reflux-pump",
  "kettle-reboiler",
];

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
  slotId: string;
  section: string;
}

// ============ DISTILLATION COMPONENT ICONS ============

function DistillationColumnIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Main column body */}
      <rect x="18" y="5" width="24" height="50" rx="4" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* Dome top */}
      <ellipse cx="30" cy="8" rx="10" ry="4" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* Trays */}
      {[15, 23, 31, 39, 47].map((y, i) => (
        <g key={i}>
          <line x1="20" y1={y} x2="40" y2={y} stroke={COLORS.skyBlue} strokeWidth="1.5" />
          {/* Vapor arrows */}
          <path 
            d={`M${25 + i * 2} ${y + 3} L${25 + i * 2} ${y - 3}`} 
            stroke={COLORS.vapor} 
            strokeWidth="1" 
            markerEnd="url(#arrowUp)"
            opacity="0.7"
          >
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
      
      {/* Feed inlet */}
      <rect x="10" y="28" width="8" height="4" fill={COLORS.liquid} />
      
      {/* Liquid at bottom */}
      <ellipse cx="30" cy="52" rx="10" ry="3" fill={COLORS.liquid} opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
      </ellipse>
      
      <defs>
        <marker id="arrowUp" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,4 L2,0 L4,4" fill={COLORS.vapor} />
        </marker>
      </defs>
    </svg>
  );
}

function CondenserIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Outer shell */}
      <circle cx="30" cy="30" r="22" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* Inner cooling coils */}
      <path 
        d="M20 25 Q25 20 30 25 Q35 30 40 25" 
        fill="none" 
        stroke={COLORS.cyan} 
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path 
        d="M20 35 Q25 30 30 35 Q35 40 40 35" 
        fill="none" 
        stroke={COLORS.cyan} 
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Cooling water indicators */}
      <circle cx="15" cy="30" r="3" fill={COLORS.cyan}>
        <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="30" r="3" fill={COLORS.cyan}>
        <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
      </circle>
      
      {/* Vapor inlet (top) */}
      <rect x="27" y="5" width="6" height="5" fill={COLORS.vapor} />
      
      {/* Liquid outlet (bottom) */}
      <rect x="27" y="50" width="6" height="5" fill={COLORS.liquid} />
    </svg>
  );
}

function RefluxDrumIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Horizontal drum body */}
      <rect x="8" y="20" width="44" height="20" rx="10" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* End caps */}
      <ellipse cx="12" cy="30" rx="4" ry="10" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      <ellipse cx="48" cy="30" rx="4" ry="10" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* Liquid level */}
      <rect x="12" y="30" width="36" height="8" fill={COLORS.liquid} opacity="0.6" rx="4">
        <animate attributeName="height" values="6;10;6" dur="3s" repeatCount="indefinite" />
      </rect>
      
      {/* Gas outlet (top) */}
      <rect x="20" y="12" width="4" height="8" fill={COLORS.vapor} />
      <text x="22" y="10" textAnchor="middle" fill={COLORS.white} fontSize="6" opacity="0.7">Gas</text>
      
      {/* Liquid outlet (bottom) */}
      <rect x="35" y="40" width="4" height="8" fill={COLORS.liquid} />
      
      {/* Water outlet */}
      <rect x="45" y="35" width="8" height="3" fill={COLORS.cyan} />
    </svg>
  );
}

function RefluxPumpIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Pump casing */}
      <circle cx="30" cy="30" r="18" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* Impeller */}
      <g>
        <circle cx="30" cy="30" r="10" fill={COLORS.liquid} opacity="0.3" />
        <path d="M30 20 L30 30 L40 30" fill="none" stroke={COLORS.skyBlue} strokeWidth="3" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M30 30 L30 40" fill="none" stroke={COLORS.skyBlue} strokeWidth="3" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M30 30 L20 30" fill="none" stroke={COLORS.skyBlue} strokeWidth="3" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Center hub */}
      <circle cx="30" cy="30" r="4" fill={COLORS.skyBlue} />
      
      {/* Inlet (left) */}
      <rect x="5" y="27" width="8" height="6" fill={COLORS.liquid} />
      
      {/* Outlet (top) */}
      <rect x="27" y="5" width="6" height="8" fill={COLORS.liquid} />
      
      {/* Flow arrow */}
      <path d="M30 8 L33 12 L27 12 Z" fill={COLORS.white}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function KettleReboilerIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Horizontal kettle body */}
      <rect x="5" y="22" width="50" height="20" rx="10" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* End caps */}
      <ellipse cx="10" cy="32" rx="5" ry="10" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      <ellipse cx="50" cy="32" rx="5" ry="10" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
      
      {/* Liquid inside */}
      <rect x="10" y="30" width="40" height="10" fill={COLORS.liquid} opacity="0.5" rx="5" />
      
      {/* Heating element / tubes */}
      <line x1="15" y1="35" x2="45" y2="35" stroke={COLORS.heat} strokeWidth="2">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="15" y1="38" x2="45" y2="38" stroke={COLORS.heat} strokeWidth="2">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.3s" />
      </line>
      
      {/* Vapor bubbles rising */}
      {[20, 30, 40].map((x, i) => (
        <circle key={i} cx={x} cy="28" r="2" fill={COLORS.vapor}>
          <animate attributeName="cy" values="32;24;32" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      
      {/* Steam/heat indicator */}
      <path d="M25 18 Q27 14 25 10" fill="none" stroke={COLORS.heat} strokeWidth="1.5" opacity="0.6">
        <animate attributeName="d" values="M25 18 Q27 14 25 10;M25 18 Q23 14 25 10;M25 18 Q27 14 25 10" dur="1s" repeatCount="indefinite" />
      </path>
      <path d="M35 18 Q37 14 35 10" fill="none" stroke={COLORS.heat} strokeWidth="1.5" opacity="0.6">
        <animate attributeName="d" values="M35 18 Q37 14 35 10;M35 18 Q33 14 35 10;M35 18 Q37 14 35 10" dur="1.2s" repeatCount="indefinite" />
      </path>
      
      {/* Liquid inlet (left) */}
      <rect x="0" y="30" width="5" height="4" fill={COLORS.liquid} />
      
      {/* Bottom product outlet */}
      <rect x="52" y="35" width="6" height="4" fill={COLORS.liquid} />
    </svg>
  );
}

// Component icon renderer
function ComponentIcon({ componentId, size = 60 }: { componentId: string; size?: number }) {
  switch (componentId) {
    case "distillation-column": return <DistillationColumnIcon size={size} />;
    case "condenser": return <CondenserIcon size={size} />;
    case "reflux-drum": return <RefluxDrumIcon size={size} />;
    case "reflux-pump": return <RefluxPumpIcon size={size} />;
    case "kettle-reboiler": return <KettleReboilerIcon size={size} />;
    default: return null;
  }
}

// ============ EVENTS FOR STEP 4 ============

const EVENTS = [
  {
    id: "pressure-drop",
    title: "Column Pressure Drop!",
    description: "Sudden pressure drop detected in distillation column. Separation efficiency decreasing.",
    icon: "warning",
    options: [
      { id: "a", text: "Increase reboiler heat duty", correct: true, points: 2 },
      { id: "b", text: "Reduce feed rate immediately", correct: false, points: 1 },
      { id: "c", text: "Open bypass valve", correct: false, points: 0 },
    ],
  },
  {
    id: "flooding",
    title: "Column Flooding Alert!",
    description: "Liquid accumulation on trays detected. Risk of product contamination.",
    icon: "alert",
    options: [
      { id: "a", text: "Reduce reflux ratio and reboiler duty", correct: true, points: 2 },
      { id: "b", text: "Increase feed preheat", correct: false, points: 0 },
      { id: "c", text: "Adjust condenser cooling", correct: false, points: 1 },
    ],
  },
  {
    id: "off-spec",
    title: "Off-Spec Product!",
    description: "Overhead product purity below specification. Customer quality at risk.",
    icon: "quality",
    options: [
      { id: "a", text: "Increase reflux ratio", correct: true, points: 2 },
      { id: "b", text: "Decrease column pressure", correct: false, points: 1 },
      { id: "c", text: "Speed up reflux pump", correct: false, points: 0 },
    ],
  },
  {
    id: "reboiler-fouling",
    title: "Reboiler Fouling Detected!",
    description: "Heat transfer coefficient dropping. Steam consumption increasing.",
    icon: "heat",
    options: [
      { id: "a", text: "Schedule online cleaning cycle", correct: true, points: 2 },
      { id: "b", text: "Increase steam pressure", correct: false, points: 0 },
      { id: "c", text: "Reduce feed rate to compensate", correct: false, points: 1 },
    ],
  },
];

// ============ MAIN CANVAS COMPONENT ============

interface Process2DCanvasProps {
  userName?: string;
  userPhone?: string;
  userSector?: string;
  isActive?: boolean;
  onComplete?: (score: number, timeLeft: number) => void;
  onExit?: () => void;
}

export default function Process2DCanvas({
  userName = "Engineer",
  userPhone = "",
  userSector = "Process",
  isActive = true,
  onExit,
}: Process2DCanvasProps) {
  // Shuffle components once on mount
  const shuffledComponents = useMemo(() => shuffleArray([...COMPONENTS]), []);
  
  // Game state
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  
  // Process simulation metrics
  const [columnTemp, setColumnTemp] = useState(150);
  const [refluxRatio, setRefluxRatio] = useState(0);
  const [separation, setSeparation] = useState(0);
  
  // 5-step game flow
  const [gameStep, setGameStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [activeSystems, setActiveSystems] = useState<string[]>([]);
  const [currentEvent, setCurrentEvent] = useState<typeof EVENTS[0] | null>(null);
  const [eventsCompleted, setEventsCompleted] = useState(0);
  const [eventScore, setEventScore] = useState(0);
  const [eventFeedback, setEventFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const totalEvents = 3;
  
  // Score breakdown
  const [scoreBreakdown, setScoreBreakdown] = useState<{
    placement: number;
    time: number;
    events: number;
    total: number;
    grade: string;
    feedback: string[];
  } | null>(null);

  // Tutorial steps
  const TUTORIAL_STEPS = useMemo(() => [
    {
      id: "welcome",
      title: "Distillation Process",
      description: "Build a complete crude oil distillation system to separate petroleum fractions efficiently.",
      icon: "welcome",
    },
    {
      id: "step1",
      title: "Step 1: Install Equipment",
      description: "Place the distillation column, condenser, reflux drum, pump, and reboiler in sequence.",
      icon: "building",
    },
    {
      id: "step2",
      title: "Step 2: Start Operation",
      description: "Once equipment is installed, start the distillation process to begin separation.",
      icon: "components",
    },
    {
      id: "step3",
      title: "Step 3-4: Handle Upsets",
      description: "Respond to process upsets: pressure drops, flooding, off-spec products, and fouling.",
      icon: "events",
    },
    {
      id: "step5",
      title: "Step 5: Get Your Score",
      description: "Receive performance assessment based on installation, timing, and upset response.",
      icon: "start",
    },
  ], []);

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Process simulation based on placed components
  useEffect(() => {
    const placedIds = placedComponents.map(p => p.componentId);
    let temp = 150;
    let ratio = 0;
    let sep = 0;
    
    if (placedIds.includes("distillation-column")) { temp = 180; sep += 20; }
    if (placedIds.includes("condenser")) { temp -= 30; sep += 15; }
    if (placedIds.includes("reflux-drum")) { ratio += 1.5; sep += 15; }
    if (placedIds.includes("reflux-pump")) { ratio += 1.0; sep += 20; }
    if (placedIds.includes("kettle-reboiler")) { temp += 50; sep += 30; }
    
    setColumnTemp(temp);
    setRefluxRatio(ratio);
    setSeparation(Math.min(100, sep));
  }, [placedComponents]);

  // Transition to Step 2 when all components placed
  useEffect(() => {
    if (placedComponents.length === CORRECT_SEQUENCE.length && gameStep === 1) {
      setGameStep(2);
    }
  }, [placedComponents.length, gameStep]);

  // Step 3: System startup animation
  useEffect(() => {
    if (gameStep !== 3) return;
    
    const systemOrder = CORRECT_SEQUENCE;
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < systemOrder.length) {
        setActiveSystems(prev => [...prev, systemOrder[currentIndex]]);
        setSimulationProgress(((currentIndex + 1) / systemOrder.length) * 100);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGameStep(4);
        }, 1000);
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, [gameStep]);

  // Start session
  useEffect(() => {
    const startSession = async () => {
      if (!userPhone || showTutorial) return;
      try {
        await fetch("/api/user/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: userPhone }),
        });
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    };
    startSession();
  }, [userPhone, showTutorial]);

  // Save score with local backup for data loss prevention
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
      if (result.isNewHighScore) console.log("New high score!");
    } else {
      console.warn("Score backed up locally:", result.error);
    }
    return result.success;
  }, [userPhone, userSector]);

  // Calculate final score
  const calculateFinalScore = useCallback(() => {
    const placementScore = Math.max(0, 4 - wrongAttempts * 0.5);
    const timeScore = timeLeft > 90 ? 2 : timeLeft > 45 ? 1 : 0;
    const normalizedEventScore = (eventScore / 6) * 4;
    const total = Math.min(10, placementScore + timeScore + normalizedEventScore);
    
    let grade = "F";
    if (total >= 9) grade = "A+";
    else if (total >= 8) grade = "A";
    else if (total >= 7) grade = "B+";
    else if (total >= 6) grade = "B";
    else if (total >= 5) grade = "C";
    else if (total >= 4) grade = "D";
    
    const feedback: string[] = [];
    if (wrongAttempts === 0) feedback.push("Perfect equipment installation!");
    else if (wrongAttempts <= 2) feedback.push("Good process knowledge.");
    else feedback.push("Review distillation fundamentals.");
    
    if (timeScore === 2) feedback.push("Excellent commissioning speed.");
    else if (timeScore === 1) feedback.push("Adequate timing.");
    else feedback.push("Work on efficiency.");
    
    if (eventScore >= 5) feedback.push("Outstanding upset management!");
    else if (eventScore >= 3) feedback.push("Good troubleshooting skills.");
    else feedback.push("Study process control strategies.");
    
    setScoreBreakdown({
      placement: placementScore,
      time: timeScore,
      events: normalizedEventScore,
      total,
      grade,
      feedback,
    });
    
    saveScoreToBackend(total, timeLeft, placedComponents.length);
  }, [wrongAttempts, timeLeft, eventScore, placedComponents.length, saveScoreToBackend]);

  // Trigger next event
  const triggerNextEvent = useCallback(() => {
    if (eventsCompleted >= totalEvents) {
      calculateFinalScore();
      setGameStep(5);
      return;
    }
    
    const availableEvents = EVENTS.filter(e => !currentEvent || e.id !== currentEvent.id);
    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    setCurrentEvent(randomEvent);
    setEventFeedback(null);
  }, [eventsCompleted, totalEvents, currentEvent, calculateFinalScore]);

  // Trigger first event when entering Step 4
  useEffect(() => {
    if (gameStep === 4 && !currentEvent) {
      triggerNextEvent();
    }
  }, [gameStep, currentEvent, triggerNextEvent]);

  // Handle event response
  const handleEventResponse = useCallback((optionId: string) => {
    if (!currentEvent) return;
    
    const selectedOption = currentEvent.options.find(o => o.id === optionId);
    if (!selectedOption) return;
    
    const isCorrect = selectedOption.correct;
    setEventScore(prev => prev + selectedOption.points);
    setEventFeedback({
      correct: isCorrect,
      message: isCorrect 
        ? "Excellent! Process stabilized." 
        : selectedOption.points > 0 
          ? "Partial solution. Review procedure."
          : "Incorrect. Process efficiency reduced.",
    });
    
    setTimeout(() => {
      setEventsCompleted(prev => {
        const newCount = prev + 1;
        if (newCount >= totalEvents) {
          calculateFinalScore();
          setGameStep(5);
        } else {
          setCurrentEvent(null);
        }
        return newCount;
      });
    }, 2000);
  }, [currentEvent, totalEvents, calculateFinalScore]);

  // Start simulation handler
  const handleStartSimulation = () => {
    setGameStep(3);
    setSimulationProgress(0);
    setActiveSystems([]);
  };

  // Timer
  useEffect(() => {
    if (!isActive || gameStep === 5 || timeLeft <= 0 || showTutorial) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, gameStep, timeLeft, showTutorial]);

  // Time's up handler
  useEffect(() => {
    if (isTimeUp && !scoreSaved) {
      const placementScore = Math.max(0, (placedComponents.length / CORRECT_SEQUENCE.length) * 4 - wrongAttempts * 0.5);
      const eventScoreNorm = (eventScore / 6) * 4;
      const partialScore = Math.max(0, placementScore + eventScoreNorm);
      
      setScoreBreakdown({
        placement: placementScore,
        time: 0,
        events: eventScoreNorm,
        total: partialScore,
        grade: partialScore >= 5 ? "C" : partialScore >= 3 ? "D" : "F",
        feedback: ["Time ran out!", "Work on speed and efficiency."],
      });
      
      saveScoreToBackend(partialScore, 0, placedComponents.length).then(saved => {
        if (saved) setScoreSaved(true);
      });
      setGameStep(5);
    }
  }, [isTimeUp, placedComponents, wrongAttempts, eventScore, saveScoreToBackend, scoreSaved]);

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

  // Get expected slot for component
  const getExpectedSlot = (componentId: string): { section: string; slotId: string } | null => {
    for (const [section, data] of Object.entries(DISTILLATION_SYSTEM)) {
      const slot = data.slots.find(s => s.componentId === componentId);
      if (slot) return { section, slotId: slot.id };
    }
    return null;
  };

  // Drag handlers
  const handleDragStart = (componentId: string) => {
    setDraggingComponent(componentId);
  };

  const handleDragEnd = () => {
    setDraggingComponent(null);
  };

  const handleDrop = (slotId: string, section: string) => {
    if (!draggingComponent) return;
    
    const expectedSlot = getExpectedSlot(draggingComponent);
    
    // Check if component is already placed
    const isAlreadyPlaced = placedComponents.some(p => p.componentId === draggingComponent);
    if (isAlreadyPlaced) {
      setHintMessage("This component is already installed.");
      setShowHint(true);
      setDraggingComponent(null);
      return;
    }
    
    // Only check if component is in the correct slot location (no sequence requirement)
    if (!expectedSlot || expectedSlot.slotId !== slotId) {
      setWrongAttempts(prev => prev + 1);
      setHintMessage("This equipment belongs in a different location.");
      setShowHint(true);
      setDraggingComponent(null);
      return;
    }
    
    const newPlacement: PlacedComponent = {
      id: `placed-${Date.now()}`,
      componentId: draggingComponent,
      slotId,
      section,
    };
    
    setPlacedComponents(prev => [...prev, newPlacement]);
    setDraggingComponent(null);
  };

  // Check if slot is filled
  const isSlotFilled = (slotId: string) => placedComponents.some(p => p.slotId === slotId);

  // Tutorial handlers
  const handleNextTutorial = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
  };

  // Render distillation process diagram
  const renderDistillationDiagram = () => {
    return (
      <div className="relative w-full h-full p-4">
        {/* SVG Background connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="vaporFlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={COLORS.liquid} />
              <stop offset="100%" stopColor={COLORS.vapor} />
            </linearGradient>
            <linearGradient id="liquidFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.vapor} />
              <stop offset="100%" stopColor={COLORS.liquid} />
            </linearGradient>
          </defs>
          
          {/* Connection lines when components are placed */}
          {placedComponents.length >= 2 && (
            <>
              {/* Column to Condenser */}
              <motion.path 
                d="M 50% 25% L 65% 15%" 
                stroke={COLORS.vapor}
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            </>
          )}
        </svg>

        <div className="relative z-10 h-full flex flex-col gap-3">
          {/* Overhead System */}
          <div 
            className="p-3 rounded-2xl"
            style={{ background: `${COLORS.cyan}10`, border: `1px solid ${COLORS.cyan}30` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="2">
                <path d="M12 2v6m0 0l3-3m-3 3l-3-3" />
                <circle cx="12" cy="14" r="8" />
              </svg>
              <span className="text-xs font-bold" style={{ color: COLORS.cyan }}>OVERHEAD SYSTEM</span>
            </div>
            <div className="flex justify-around gap-2">
              {DISTILLATION_SYSTEM.overhead.slots.map(slot => (
                <div
                  key={slot.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slot.id, "overhead")}
                  className="w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all"
                  style={{
                    background: isSlotFilled(slot.id) ? `${COLORS.cyan}20` : COLORS.glass,
                    border: `2px dashed ${isSlotFilled(slot.id) ? COLORS.cyan : COLORS.glassBorder}`,
                  }}
                >
                  {isSlotFilled(slot.id) ? (
                    <ComponentIcon componentId={slot.componentId} size={48} />
                  ) : (
                    <span className="text-xl font-bold" style={{ color: `${COLORS.white}30` }}>?</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Column */}
          <div 
            className="flex-1 p-3 rounded-2xl flex items-center justify-center"
            style={{ background: `${COLORS.skyBlue}10`, border: `1px solid ${COLORS.skyBlue}30` }}
          >
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="2">
                    <rect x="6" y="2" width="12" height="20" rx="2" />
                    <path d="M6 8h12M6 12h12M6 16h12" />
                  </svg>
                  <span className="text-xs font-bold" style={{ color: COLORS.skyBlue }}>DISTILLATION COLUMN</span>
                </div>
                {DISTILLATION_SYSTEM.column.slots.map(slot => (
                  <div
                    key={slot.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(slot.id, "column")}
                    className="w-28 h-36 rounded-xl flex items-center justify-center transition-all mx-auto"
                    style={{
                      background: isSlotFilled(slot.id) ? `${COLORS.skyBlue}20` : COLORS.glass,
                      border: `2px dashed ${isSlotFilled(slot.id) ? COLORS.skyBlue : COLORS.glassBorder}`,
                    }}
                  >
                    {isSlotFilled(slot.id) ? (
                      <ComponentIcon componentId={slot.componentId} size={80} />
                    ) : (
                      <span className="text-3xl font-bold" style={{ color: `${COLORS.white}30` }}>?</span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Feed indicator */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] mb-1" style={{ color: `${COLORS.white}60` }}>Feed</div>
                <div className="w-12 h-4 rounded" style={{ background: COLORS.liquid }}>
                  <motion.div 
                    className="h-full w-2 rounded" 
                    style={{ background: COLORS.white }}
                    animate={{ x: [0, 40, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <div className="text-[8px] mt-1" style={{ color: `${COLORS.white}40` }}>Crude Oil</div>
              </div>
            </div>
          </div>

          {/* Bottoms System */}
          <div 
            className="p-3 rounded-2xl"
            style={{ background: `${COLORS.heat}10`, border: `1px solid ${COLORS.heat}30` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.heat} strokeWidth="2">
                <path d="M12 22v-6m0 0l3 3m-3-3l-3 3" />
                <rect x="4" y="4" width="16" height="8" rx="2" />
              </svg>
              <span className="text-xs font-bold" style={{ color: COLORS.heat }}>BOTTOMS SYSTEM</span>
            </div>
            <div className="flex justify-center">
              {DISTILLATION_SYSTEM.bottoms.slots.map(slot => (
                <div
                  key={slot.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slot.id, "bottoms")}
                  className="w-28 h-20 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: isSlotFilled(slot.id) ? `${COLORS.heat}20` : COLORS.glass,
                    border: `2px dashed ${isSlotFilled(slot.id) ? COLORS.heat : COLORS.glassBorder}`,
                  }}
                >
                  {isSlotFilled(slot.id) ? (
                    <ComponentIcon componentId={slot.componentId} size={56} />
                  ) : (
                    <span className="text-xl font-bold" style={{ color: `${COLORS.white}30` }}>?</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${COLORS.darkBlue} 0%, #0a1628 50%, #050d18 100%)` }}
    >
      {/* Animated background - bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${COLORS.vapor}40 0%, transparent 70%)`,
              width: 10 + (i % 3) * 5,
              height: 10 + (i % 3) * 5,
            }}
            initial={{ x: `${(i * 7) % 100}%`, y: "100%", opacity: 0.3 }}
            animate={{ y: "-10%", opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* HEADER */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-4 flex items-center justify-between"
        style={{ background: COLORS.glass, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${COLORS.glassBorder}` }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke={COLORS.white} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.white }}>Distillation Process</h1>
            <p className="text-xs" style={{ color: `${COLORS.white}60` }}>
              {gameStep === 1 && "Install equipment"}
              {gameStep === 2 && "Ready to operate"}
              {gameStep === 3 && "Starting up..."}
              {gameStep === 4 && `Event ${eventsCompleted + 1}/${totalEvents}`}
              {gameStep === 5 && "Complete!"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Separation Display */}
          <div className="text-center px-3 py-1 rounded-lg" style={{ background: separation >= 80 ? `${COLORS.green}20` : `${COLORS.skyBlue}20` }}>
            <div className="text-xs" style={{ color: `${COLORS.white}60` }}>Sep</div>
            <div className="text-lg font-bold" style={{ color: separation >= 80 ? COLORS.green : COLORS.skyBlue }}>
              {separation}%
            </div>
          </div>
          
          {/* Timer */}
          <div 
            className="px-4 py-2 rounded-xl font-mono text-xl font-bold"
            style={{ 
              background: timeLeft <= 30 ? `${COLORS.red}20` : COLORS.glass,
              color: timeLeft <= 30 ? COLORS.red : COLORS.skyBlue,
              border: `1px solid ${timeLeft <= 30 ? COLORS.red : COLORS.skyBlue}30`,
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className={`relative z-10 flex ${isMobile ? 'flex-col' : 'flex-row'} h-[calc(100vh-72px)]`}>
        {/* LEFT PANEL - Component Toolbox */}
        {!isMobile && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-56 flex-shrink-0 m-4 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
          >
            <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
              <h2 className="text-base font-bold" style={{ color: COLORS.white }}>Equipment</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.white}60` }}>Drag to process</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {shuffledComponents.map((comp, i) => {
                const isPlaced = placedComponents.some(p => p.componentId === comp.id);
                
                return (
                  <motion.div
                    key={comp.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    draggable={!isPlaced && gameStep === 1}
                    onDragStart={() => handleDragStart(comp.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-2 rounded-xl flex items-center gap-3 transition-all ${
                      isPlaced ? 'opacity-40' : 'cursor-grab active:cursor-grabbing hover:translate-x-1'
                    }`}
                    style={{ 
                      background: isPlaced ? `${COLORS.skyBlue}10` : COLORS.glass,
                      border: `1px solid ${isPlaced ? COLORS.skyBlue : COLORS.glassBorder}`,
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${COLORS.skyBlue}15` }}
                    >
                      {isPlaced ? (
                        <svg className="w-5 h-5" fill="none" stroke={COLORS.skyBlue} strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <ComponentIcon componentId={comp.id} size={36} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: COLORS.white }}>{comp.name}</p>
                      <p className="text-[10px] truncate" style={{ color: `${COLORS.white}50` }}>{comp.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CENTER - Distillation Diagram */}
        <div className="flex-1 p-4 flex flex-col">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
          >
            {renderDistillationDiagram()}
          </motion.div>
        </div>

        {/* RIGHT PANEL - Status */}
        {!isMobile && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-64 flex-shrink-0 m-4 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
          >
            <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
              <h2 className="text-base font-bold" style={{ color: COLORS.white }}>Process Status</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.white}60` }}>Monitor parameters</p>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              {/* Column Temperature */}
              <div className="p-3 rounded-xl" style={{ background: COLORS.glass }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: `${COLORS.white}70` }}>Column Temp</span>
                  <span className="text-sm font-bold" style={{ color: COLORS.heat }}>{columnTemp}°C</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${COLORS.white}10` }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, columnTemp / 2.5)}%`, background: COLORS.heat }}
                  />
                </div>
              </div>

              {/* Reflux Ratio */}
              <div className="p-3 rounded-xl" style={{ background: COLORS.glass }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: `${COLORS.white}70` }}>Reflux Ratio</span>
                  <span className="text-sm font-bold" style={{ color: COLORS.cyan }}>{refluxRatio.toFixed(1)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${COLORS.white}10` }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, refluxRatio * 40)}%`, background: COLORS.cyan }}
                  />
                </div>
              </div>

              {/* Separation Efficiency */}
              <div className="p-3 rounded-xl" style={{ background: COLORS.glass }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: `${COLORS.white}70` }}>Separation</span>
                  <span className="text-sm font-bold" style={{ color: separation >= 80 ? COLORS.green : COLORS.skyBlue }}>{separation}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${COLORS.white}10` }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${separation}%`, background: separation >= 80 ? COLORS.green : COLORS.skyBlue }}
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="text-center pt-2">
                <p className="text-xs" style={{ color: `${COLORS.white}50` }}>
                  Equipment: {placedComponents.length}/{CORRECT_SEQUENCE.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* MOBILE TOOLBAR */}
        {isMobile && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-shrink-0 p-5"
            style={{ background: COLORS.glass, borderTop: `1px solid ${COLORS.glassBorder}` }}
          >
            <div className="flex gap-4 overflow-x-auto pb-2">
              {shuffledComponents.map(comp => {
                const isPlaced = placedComponents.some(p => p.componentId === comp.id);
                return (
                  <motion.div
                    key={comp.id}
                    draggable={!isPlaced && gameStep === 1}
                    onDragStart={() => handleDragStart(comp.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex-shrink-0 p-2.5 rounded-2xl flex flex-col items-center ${isPlaced ? 'opacity-40' : ''}`}
                    style={{ background: COLORS.glass, border: `2px solid ${isPlaced ? COLORS.skyBlue : COLORS.glassBorder}`, minWidth: 90 }}
                  >
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.skyBlue}20` }}>
                      {isPlaced ? (
                        <svg className="w-7 h-7" fill="none" stroke={COLORS.skyBlue} strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <ComponentIcon componentId={comp.id} size={36} />
                      )}
                    </div>
                    <span className="text-xs font-bold mt-2 text-center leading-tight" style={{ color: `${COLORS.white}90` }}>
                      {comp.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
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
            <div className="absolute inset-0 bg-black/90" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative z-10 max-w-md w-full p-8 rounded-3xl text-center"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.glassBorder}` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${COLORS.skyBlue}20` }}>
                {TUTORIAL_STEPS[tutorialStep].icon === "welcome" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="1.5">
                    <rect x="6" y="2" width="12" height="20" rx="2" />
                    <path d="M6 6h12M6 10h12M6 14h12M6 18h12" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "building" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" strokeLinecap="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "components" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" fill={`${COLORS.skyBlue}30`} />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "events" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="1.5">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "start" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              
              <div className="flex justify-center gap-1 mb-4">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === tutorialStep ? COLORS.skyBlue : `${COLORS.white}30` }} />
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.white }}>{TUTORIAL_STEPS[tutorialStep].title}</h3>
              <p className="text-sm mb-6" style={{ color: `${COLORS.white}80` }}>{TUTORIAL_STEPS[tutorialStep].description}</p>
              
              <div className="flex gap-3 justify-center">
                <button onClick={handleSkipTutorial} className="px-4 py-2 rounded-xl" style={{ background: COLORS.glass, color: `${COLORS.white}80` }}>
                  Skip
                </button>
                <button onClick={handleNextTutorial} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.skyBlue, color: COLORS.darkBlue }}>
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? "Start!" : "Next"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HINT MODAL */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHint(false)}
          >
            <div className="absolute inset-0 bg-black/80" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative z-10 max-w-sm p-6 rounded-2xl text-center"
              style={{ background: COLORS.glass, backdropFilter: 'blur(20px)', border: `1px solid ${COLORS.skyBlue}50` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.cyan}20` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
                  <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.cyan }}>Hint</h3>
              <p className="text-sm mb-4" style={{ color: COLORS.white }}>{hintMessage}</p>
              <button onClick={() => setShowHint(false)} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.skyBlue, color: COLORS.darkBlue }}>
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 2: START SIMULATION OVERLAY */}
      <AnimatePresence>
        {gameStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-10 max-w-lg w-full p-8 rounded-3xl text-center"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.skyBlue}50` }}
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: `${COLORS.skyBlue}20` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={COLORS.skyBlue} strokeWidth="1.5">
                  <rect x="6" y="2" width="12" height="20" rx="2" />
                  <path d="M6 6h12M6 10h12M6 14h12" />
                </svg>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.white }}>Equipment Installed!</h2>
              <p className="text-sm mb-6" style={{ color: `${COLORS.white}70` }}>
                Start the distillation process to begin crude oil separation.
              </p>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="p-3 rounded-lg" style={{ background: `${COLORS.heat}20` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.heat }}>{columnTemp}°C</div>
                  <div className="text-[10px]" style={{ color: `${COLORS.white}60` }}>Column Temp</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: `${COLORS.cyan}20` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.cyan }}>{refluxRatio.toFixed(1)}</div>
                  <div className="text-[10px]" style={{ color: `${COLORS.white}60` }}>Reflux Ratio</div>
                </div>
              </div>
              
              <motion.button 
                onClick={handleStartSimulation}
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto"
                style={{ background: `linear-gradient(135deg, ${COLORS.skyBlue}, ${COLORS.cyan})`, color: COLORS.darkBlue }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Distillation
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3: SYSTEMS STARTING OVERLAY */}
      <AnimatePresence>
        {gameStep === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative z-10 max-w-md w-full p-8 rounded-3xl text-center"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.skyBlue}50` }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.white }}>Process Starting</h2>
              
              <div className="mb-6">
                <div className="h-3 rounded-full overflow-hidden" style={{ background: `${COLORS.white}10` }}>
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${COLORS.skyBlue}, ${COLORS.cyan})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${simulationProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {COMPONENTS.map((comp) => {
                  const isActive = activeSystems.includes(comp.id);
                  return (
                    <motion.div 
                      key={comp.id}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: isActive ? 1 : 0.3 }}
                      className="flex items-center gap-3 p-2 rounded-lg"
                      style={{ background: isActive ? `${COLORS.skyBlue}15` : 'transparent' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: isActive ? COLORS.skyBlue : COLORS.glass }}
                      >
                        {isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke={COLORS.darkBlue} strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: `${COLORS.white}30` }} />
                        )}
                      </div>
                      <span className="text-sm" style={{ color: isActive ? COLORS.white : `${COLORS.white}50` }}>
                        {comp.name}
                      </span>
                      {isActive && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: `${COLORS.green}20`, color: COLORS.green }}>
                          ONLINE
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 4: EVENT MODAL */}
      <AnimatePresence>
        {gameStep === 4 && currentEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-10 max-w-lg w-full p-6 rounded-3xl"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.red}50` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.red}20` }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: COLORS.white }}>{currentEvent.title}</h3>
                  <p className="text-sm mt-1" style={{ color: `${COLORS.white}70` }}>{currentEvent.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {currentEvent.options.map(option => (
                  <motion.button
                    key={option.id}
                    onClick={() => !eventFeedback && handleEventResponse(option.id)}
                    disabled={!!eventFeedback}
                    className="w-full p-4 rounded-xl text-left transition-all"
                    style={{ 
                      background: eventFeedback 
                        ? option.correct 
                          ? `${COLORS.green}20` 
                          : COLORS.glass
                        : COLORS.glass,
                      border: `1px solid ${eventFeedback && option.correct ? COLORS.green : COLORS.glassBorder}`,
                      opacity: eventFeedback && !option.correct ? 0.5 : 1,
                    }}
                    whileHover={!eventFeedback ? { scale: 1.01 } : {}}
                    whileTap={!eventFeedback ? { scale: 0.99 } : {}}
                  >
                    <span className="text-sm" style={{ color: COLORS.white }}>{option.text}</span>
                  </motion.button>
                ))}
              </div>
              
              {eventFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-center"
                  style={{ background: eventFeedback.correct ? `${COLORS.green}20` : `${COLORS.red}20` }}
                >
                  <p className="text-sm font-medium" style={{ color: eventFeedback.correct ? COLORS.green : COLORS.red }}>
                    {eventFeedback.message}
                  </p>
                </motion.div>
              )}
              
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(totalEvents)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-2 rounded-full" 
                    style={{ background: i < eventsCompleted ? COLORS.green : i === eventsCompleted ? COLORS.skyBlue : `${COLORS.white}30` }} 
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 5: FINAL SCORE */}
      <AnimatePresence>
        {gameStep === 5 && scoreBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/90" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-10 max-w-md w-full p-8 rounded-3xl text-center"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.skyBlue}50` }}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.skyBlue}30, ${COLORS.cyan}30)`,
                  border: `3px solid ${COLORS.skyBlue}`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <span className="text-4xl font-bold" style={{ color: COLORS.skyBlue }}>{scoreBreakdown.grade}</span>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-1" style={{ color: COLORS.white }}>Process Score</h2>
              <p className="text-4xl font-bold mb-4" style={{ color: COLORS.skyBlue }}>{scoreBreakdown.total.toFixed(1)}/10</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: COLORS.glass }}>
                  <span className="text-sm" style={{ color: `${COLORS.white}70` }}>Installation</span>
                  <span className="font-bold" style={{ color: COLORS.skyBlue }}>{scoreBreakdown.placement.toFixed(1)}/4</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: COLORS.glass }}>
                  <span className="text-sm" style={{ color: `${COLORS.white}70` }}>Time Bonus</span>
                  <span className="font-bold" style={{ color: COLORS.skyBlue }}>{scoreBreakdown.time.toFixed(1)}/2</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: COLORS.glass }}>
                  <span className="text-sm" style={{ color: `${COLORS.white}70` }}>Upset Response</span>
                  <span className="font-bold" style={{ color: COLORS.skyBlue }}>{scoreBreakdown.events.toFixed(1)}/4</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-6 text-left">
                {scoreBreakdown.feedback.map((fb, i) => (
                  <p key={i} className="text-xs flex items-center gap-2" style={{ color: `${COLORS.white}70` }}>
                    <span style={{ color: COLORS.skyBlue }}>•</span> {fb}
                  </p>
                ))}
              </div>
              
              <button 
                onClick={() => setShowThankYou(true)}
                className="w-full px-6 py-4 rounded-xl font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${COLORS.skyBlue}, ${COLORS.cyan})`, color: COLORS.darkBlue }}
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
        score={scoreBreakdown?.total || 0}
        grade={scoreBreakdown?.grade || ""}
        sector={userSector}
        onComplete={() => onExit?.()}
      />
    </div>
  );
}
