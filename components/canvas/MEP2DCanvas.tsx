"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThankYouOverlay from "./ThankYouOverlay";
import { saveScoreWithBackup } from "@/lib/utils";

// MEP Infrastructure Color Palette
const COLORS = {
  emerald: "#10B981",
  teal: "#14B8A6",
  darkGreen: "#064E3B",
  deepGreen: "#022C22",
  amber: "#F59E0B",
  orange: "#F97316",
  red: "#EF4444",
  blue: "#3B82F6",
  coolWhite: "#F0FDF4",
  glass: "rgba(255, 255, 255, 0.08)",
  glassLight: "rgba(255, 255, 255, 0.12)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
};

// Building floor structure with slots
const BUILDING_STRUCTURE = {
  roof: {
    name: "Roof",
    color: COLORS.teal,
    slots: [
      { id: "roof-1", componentId: "water-tank", label: "Water Tank" },
      { id: "roof-2", componentId: "cooling-unit", label: "Cooling Unit" },
    ],
  },
  floor2: {
    name: "Floor 2",
    color: COLORS.amber,
    slots: [
      { id: "floor2-1", componentId: "electrical-panel", label: "Electrical Panel" },
      { id: "floor2-2", componentId: "lighting", label: "Lighting" },
    ],
  },
  floor1: {
    name: "Floor 1",
    color: COLORS.blue,
    slots: [
      { id: "floor1-1", componentId: "pump", label: "Pump" },
      { id: "floor1-2", componentId: "water-supply", label: "Water Supply" },
    ],
  },
};

// MEP Components - ordered for building construction (bottom to top)
const COMPONENTS = [
  { id: "pump", name: "Pump", floor: "floor1", type: "mechanical" },
  { id: "water-supply", name: "Water Supply", floor: "floor1", type: "plumbing" },
  { id: "electrical-panel", name: "Electrical Panel", floor: "floor2", type: "electrical" },
  { id: "lighting", name: "Lighting", floor: "floor2", type: "electrical" },
  { id: "water-tank", name: "Water Tank", floor: "roof", type: "plumbing" },
  { id: "cooling-unit", name: "Cooling Unit", floor: "roof", type: "mechanical" },
];

const CORRECT_SEQUENCE = ["pump", "water-supply", "electrical-panel", "lighting", "water-tank", "cooling-unit"];

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
  floor: string;
}

// ============ MEP COMPONENT ICONS ============

function PumpIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="22" fill={COLORS.deepGreen} stroke={COLORS.emerald} strokeWidth="2" />
      <circle cx="30" cy="30" r="14" fill={COLORS.emerald} opacity="0.3" />
      <circle cx="30" cy="30" r="8" fill={COLORS.deepGreen} stroke={COLORS.emerald} strokeWidth="1.5" />
      {/* Impeller blades */}
      <g>
        <rect x="28" y="18" width="4" height="12" rx="1" fill={COLORS.emerald}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <rect x="28" y="30" width="4" height="12" rx="1" fill={COLORS.emerald}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <rect x="18" y="28" width="12" height="4" rx="1" fill={COLORS.emerald}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <rect x="30" y="28" width="12" height="4" rx="1" fill={COLORS.emerald}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1.5s" repeatCount="indefinite" />
        </rect>
      </g>
      {/* Inlet/outlet */}
      <rect x="5" y="26" width="8" height="8" rx="2" fill={COLORS.blue} opacity="0.8" />
      <rect x="47" y="26" width="8" height="8" rx="2" fill={COLORS.blue} opacity="0.8" />
    </svg>
  );
}

function WaterSupplyIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Main pipe */}
      <rect x="10" y="25" width="40" height="10" rx="3" fill={COLORS.blue} />
      {/* Valve */}
      <rect x="25" y="20" width="10" height="20" rx="2" fill={COLORS.deepGreen} stroke={COLORS.blue} strokeWidth="1.5" />
      <circle cx="30" cy="30" r="5" fill={COLORS.blue} opacity="0.6" />
      {/* Handle */}
      <rect x="22" y="16" width="16" height="4" rx="1" fill={COLORS.teal} />
      {/* Flow indicators */}
      <circle cx="18" cy="30" r="2" fill={COLORS.coolWhite}>
        <animate attributeName="cx" from="14" to="46" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Connectors */}
      <rect x="5" y="27" width="6" height="6" rx="1" fill={COLORS.glass} stroke={COLORS.glassBorder} />
      <rect x="49" y="27" width="6" height="6" rx="1" fill={COLORS.glass} stroke={COLORS.glassBorder} />
    </svg>
  );
}

function ElectricalPanelIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Panel body */}
      <rect x="12" y="8" width="36" height="44" rx="3" fill={COLORS.deepGreen} stroke={COLORS.amber} strokeWidth="2" />
      {/* Panel door */}
      <rect x="15" y="11" width="30" height="38" rx="2" fill={COLORS.glass} stroke={COLORS.glassBorder} />
      {/* Circuit breakers */}
      <rect x="20" y="16" width="8" height="6" rx="1" fill={COLORS.amber} />
      <rect x="32" y="16" width="8" height="6" rx="1" fill={COLORS.amber} />
      <rect x="20" y="26" width="8" height="6" rx="1" fill={COLORS.emerald} />
      <rect x="32" y="26" width="8" height="6" rx="1" fill={COLORS.emerald} />
      <rect x="20" y="36" width="8" height="6" rx="1" fill={COLORS.red} opacity="0.8" />
      <rect x="32" y="36" width="8" height="6" rx="1" fill={COLORS.amber} />
      {/* Main switch */}
      <rect x="26" y="46" width="8" height="4" rx="1" fill={COLORS.red}>
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* Status LED */}
      <circle cx="48" cy="12" r="3" fill={COLORS.emerald}>
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function LightingIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Fixture base */}
      <rect x="15" y="8" width="30" height="8" rx="2" fill={COLORS.glass} stroke={COLORS.glassBorder} />
      {/* Light panel */}
      <rect x="18" y="16" width="24" height="12" rx="2" fill={COLORS.amber} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* Light rays */}
      <g opacity="0.6">
        <line x1="22" y1="28" x2="18" y2="40" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
        </line>
        <line x1="30" y1="28" x2="30" y2="42" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
        </line>
        <line x1="38" y1="28" x2="42" y2="40" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="0.4s" />
        </line>
      </g>
      {/* Mounting wire */}
      <line x1="30" y1="4" x2="30" y2="8" stroke={COLORS.glassBorder} strokeWidth="2" />
    </svg>
  );
}

function WaterTankIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Tank body */}
      <rect x="12" y="12" width="36" height="36" rx="4" fill={COLORS.deepGreen} stroke={COLORS.blue} strokeWidth="2" />
      {/* Water level */}
      <rect x="15" y="24" width="30" height="21" rx="2" fill={COLORS.blue} opacity="0.5">
        <animate attributeName="height" values="21;18;21" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y" values="24;27;24" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Wave effect */}
      <path d="M15 26 Q22 23 30 26 T45 26" fill="none" stroke={COLORS.blue} strokeWidth="1.5" opacity="0.8">
        <animate attributeName="d" values="M15 26 Q22 23 30 26 T45 26;M15 26 Q22 29 30 26 T45 26;M15 26 Q22 23 30 26 T45 26" dur="2s" repeatCount="indefinite" />
      </path>
      {/* Lid */}
      <rect x="10" y="8" width="40" height="6" rx="2" fill={COLORS.teal} />
      {/* Level indicator */}
      <rect x="48" y="20" width="4" height="24" rx="1" fill={COLORS.glass} stroke={COLORS.glassBorder} />
      <rect x="49" y="28" width="2" height="15" rx="0.5" fill={COLORS.blue}>
        <animate attributeName="height" values="15;12;15" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y" values="28;31;28" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Inlet pipe */}
      <rect x="20" y="4" width="6" height="6" rx="1" fill={COLORS.blue} opacity="0.7" />
    </svg>
  );
}

function CoolingUnitIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Unit body */}
      <rect x="8" y="15" width="44" height="35" rx="4" fill={COLORS.deepGreen} stroke={COLORS.teal} strokeWidth="2" />
      {/* Fan grill */}
      <circle cx="30" cy="32" r="14" fill={COLORS.glass} stroke={COLORS.glassBorder} />
      {/* Fan blades */}
      <g>
        <ellipse cx="30" cy="25" rx="3" ry="8" fill={COLORS.teal}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 32" to="360 30 32" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="30" cy="39" rx="3" ry="8" fill={COLORS.teal}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 32" to="360 30 32" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="23" cy="32" rx="8" ry="3" fill={COLORS.teal}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 32" to="360 30 32" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="37" cy="32" rx="8" ry="3" fill={COLORS.teal}>
          <animateTransform attributeName="transform" type="rotate" from="0 30 32" to="360 30 32" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
      </g>
      {/* Center hub */}
      <circle cx="30" cy="32" r="4" fill={COLORS.deepGreen} stroke={COLORS.teal} strokeWidth="1" />
      {/* Control panel */}
      <rect x="12" y="46" width="16" height="4" rx="1" fill={COLORS.glass} />
      <circle cx="16" cy="48" r="1.5" fill={COLORS.emerald} />
      <circle cx="22" cy="48" r="1.5" fill={COLORS.amber} />
      {/* Frost indicator */}
      <circle cx="44" cy="48" r="3" fill={COLORS.teal} opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// Component icon renderer
function ComponentIcon({ componentId, size = 60 }: { componentId: string; size?: number }) {
  switch (componentId) {
    case "pump": return <PumpIcon size={size} />;
    case "water-supply": return <WaterSupplyIcon size={size} />;
    case "electrical-panel": return <ElectricalPanelIcon size={size} />;
    case "lighting": return <LightingIcon size={size} />;
    case "water-tank": return <WaterTankIcon size={size} />;
    case "cooling-unit": return <CoolingUnitIcon size={size} />;
    default: return null;
  }
}

// Get type color - all components use same color
function getTypeColor(type: string): string {
  // Using emerald for all MEP components for consistency
  return COLORS.emerald;
}

// ============ MAIN CANVAS COMPONENT ============

interface MEP2DCanvasProps {
  userName?: string;
  userPhone?: string;
  userSector?: string;
  isActive?: boolean;
  onComplete?: (score: number, timeLeft: number) => void;
  onExit?: () => void;
}

export function MEP2DCanvas({ 
  userName = "Engineer",
  userPhone,
  userSector = "MEP",
  isActive = true,
  onComplete,
  onExit,
}: MEP2DCanvasProps) {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [shuffledComponents] = useState(() => shuffleArray(COMPONENTS));
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // More time for full game
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastFault, setLastFault] = useState<string | null>(null);
  const [buildingPower, setBuildingPower] = useState(0); // 0-100%
  const canvasRef = useRef<HTMLDivElement>(null);

  // ============ NEW 5-STEP GAME STATE ============
  const [gameStep, setGameStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  // Step 1: Drag components (default)
  // Step 2: Start simulation (all placed)
  // Step 3: Systems turning ON animation
  // Step 4: Handle events
  // Step 5: Score + explanation

  // Simulation state
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [activeSystems, setActiveSystems] = useState<string[]>([]);
  
  // Events state
  const [currentEvent, setCurrentEvent] = useState<{
    id: string;
    title: string;
    description: string;
    type: 'demand' | 'surge' | 'leak' | 'overload';
    options: { id: string; label: string; correct: boolean; points: number }[];
  } | null>(null);
  const [eventsCompleted, setEventsCompleted] = useState(0);
  const [eventScore, setEventScore] = useState(0);
  const [eventFeedback, setEventFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [totalEvents] = useState(3);

  // Final score breakdown
  const [scoreBreakdown, setScoreBreakdown] = useState<{
    placement: number;
    time: number;
    events: number;
    total: number;
    grade: string;
    feedback: string[];
  } | null>(null);

  // Event definitions
  const EVENTS = useMemo(() => [
    {
      id: "high-demand",
      title: "Peak Demand Alert",
      description: "Building occupancy hits 100%. HVAC and electrical systems under heavy load.",
      type: "demand" as const,
      options: [
        { id: "a", label: "Increase pump speed & activate backup cooling", correct: true, points: 2 },
        { id: "b", label: "Reduce lighting to 50%", correct: false, points: 0 },
        { id: "c", label: "Shut down non-essential systems", correct: false, points: 1 },
      ],
    },
    {
      id: "power-surge",
      title: "Power Surge Detected",
      description: "Voltage spike detected in the main electrical panel. Risk of equipment damage.",
      type: "surge" as const,
      options: [
        { id: "a", label: "Disconnect sensitive equipment", correct: false, points: 1 },
        { id: "b", label: "Activate surge protection & balance loads", correct: true, points: 2 },
        { id: "c", label: "Switch to backup generator", correct: false, points: 0 },
      ],
    },
    {
      id: "water-leak",
      title: "Water Pressure Drop",
      description: "Floor 2 reports low water pressure. Possible leak in the supply line.",
      type: "leak" as const,
      options: [
        { id: "a", label: "Increase pump output", correct: false, points: 0 },
        { id: "b", label: "Isolate Floor 2 supply & inspect", correct: true, points: 2 },
        { id: "c", label: "Drain the water tank", correct: false, points: 0 },
      ],
    },
    {
      id: "cooling-overload",
      title: "Cooling System Overload",
      description: "Rooftop cooling unit temperature exceeds safe limits. Compressor at risk.",
      type: "overload" as const,
      options: [
        { id: "a", label: "Shut down cooling immediately", correct: false, points: 0 },
        { id: "b", label: "Reduce cooling load & clean filters", correct: true, points: 2 },
        { id: "c", label: "Increase water flow to cooling unit", correct: false, points: 1 },
      ],
    },
  ], []);

  // Tutorial steps
  const TUTORIAL_STEPS = [
    {
      id: "welcome",
      title: "MEP Systems Builder",
      description: "Build and operate a complete building infrastructure with Mechanical, Electrical, and Plumbing systems.",
      icon: "welcome",
    },
    {
      id: "step1",
      title: "Step 1: Install Components",
      description: "Drag MEP components into the correct building slots. Install from Floor 1 up to the Roof.",
      icon: "building",
    },
    {
      id: "step2",
      title: "Step 2: Start Simulation",
      description: "Once all components are placed, start the building simulation to power up systems.",
      icon: "components",
    },
    {
      id: "step3",
      title: "Step 3-4: Handle Events",
      description: "Watch systems come online, then respond to real-time building events and emergencies.",
      icon: "events",
    },
    {
      id: "step5",
      title: "Step 5: Get Your Score",
      description: "Receive a detailed breakdown of your performance with expert feedback. Good luck!",
      icon: "start",
    },
  ];

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Building power effect
  useEffect(() => {
    const targetPower = (placedComponents.length / CORRECT_SEQUENCE.length) * 100;
    if (buildingPower < targetPower) {
      const interval = setInterval(() => {
        setBuildingPower(prev => Math.min(targetPower, prev + 2));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [placedComponents.length, buildingPower]);

  // Check if all components placed -> move to Step 2
  useEffect(() => {
    if (placedComponents.length === CORRECT_SEQUENCE.length && gameStep === 1) {
      setGameStep(2);
    }
  }, [placedComponents.length, gameStep]);

  // Step 3: Simulation animation
  useEffect(() => {
    if (gameStep !== 3) return;
    
    const systemOrder = ["pump", "water-supply", "electrical-panel", "lighting", "water-tank", "cooling-unit"];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < systemOrder.length) {
        setActiveSystems(prev => [...prev, systemOrder[currentIndex]]);
        setSimulationProgress(((currentIndex + 1) / systemOrder.length) * 100);
        currentIndex++;
      } else {
        clearInterval(interval);
        // Move to Step 4 after animation
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
    // Placement score (max 4 points)
    const placementScore = Math.max(0, 4 - wrongAttempts * 0.5);
    
    // Time bonus (max 2 points)
    const timeScore = timeLeft > 60 ? 2 : timeLeft > 30 ? 1 : 0;
    
    // Event score (max 4 points from 3 events × 2 points each = 6, normalized to 4)
    const normalizedEventScore = (eventScore / 6) * 4;
    
    const total = Math.min(10, placementScore + timeScore + normalizedEventScore);
    
    // Grade
    let grade = "F";
    if (total >= 9) grade = "A+";
    else if (total >= 8) grade = "A";
    else if (total >= 7) grade = "B+";
    else if (total >= 6) grade = "B";
    else if (total >= 5) grade = "C";
    else if (total >= 4) grade = "D";
    
    // Feedback
    const feedback: string[] = [];
    if (wrongAttempts === 0) feedback.push("Perfect component placement!");
    else if (wrongAttempts <= 2) feedback.push("Good installation sequence.");
    else feedback.push("Review MEP installation order.");
    
    if (timeScore === 2) feedback.push("Excellent time management.");
    else if (timeScore === 1) feedback.push("Decent pace, room for improvement.");
    else feedback.push("Work on efficiency to save time.");
    
    if (eventScore >= 5) feedback.push("Outstanding crisis management!");
    else if (eventScore >= 3) feedback.push("Good problem-solving skills.");
    else feedback.push("Study building systems operations.");
    
    setScoreBreakdown({
      placement: placementScore,
      time: timeScore,
      events: normalizedEventScore,
      total,
      grade,
      feedback,
    });
    
    // Save to backend
    saveScoreToBackend(total, timeLeft, placedComponents.length);
  }, [wrongAttempts, timeLeft, eventScore, placedComponents.length, saveScoreToBackend]);

  // Trigger next event (or final score)
  const triggerNextEvent = useCallback(() => {
    if (eventsCompleted >= totalEvents) {
      // All events done, calculate final score
      calculateFinalScore();
      setGameStep(5);
      return;
    }
    
    // Pick a random event not yet used
    const availableEvents = EVENTS.filter(e => !currentEvent || e.id !== currentEvent.id);
    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    setCurrentEvent(randomEvent);
    setEventFeedback(null);
  }, [eventsCompleted, totalEvents, EVENTS, currentEvent, calculateFinalScore]);

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
        ? "Excellent decision! Systems stabilized." 
        : selectedOption.points > 0 
          ? "Partially correct. Could be optimized."
          : "Incorrect response. System efficiency reduced.",
    });
    
    // Move to next event after delay
    setTimeout(() => {
      setEventsCompleted(prev => {
        const newCount = prev + 1;
        if (newCount >= totalEvents) {
          calculateFinalScore();
          setGameStep(5);
        } else {
          // Clear current event to trigger next
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

  // Timer - runs during steps 1-4
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
      // Calculate partial score based on progress
      const placementScore = Math.max(0, (placedComponents.length / CORRECT_SEQUENCE.length) * 4 - wrongAttempts * 0.5);
      const eventScoreNorm = (eventScore / 6) * 4;
      const partialScore = Math.max(0, placementScore + eventScoreNorm);
      
      setScoreBreakdown({
        placement: placementScore,
        time: 0,
        events: eventScoreNorm,
        total: partialScore,
        grade: partialScore >= 5 ? "C" : partialScore >= 3 ? "D" : "F",
        feedback: ["Time ran out!", "Try to work faster next time."],
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

  // Check if component is next
  const isCorrectNext = useCallback((componentId: string) => {
    const placedIds = placedComponents.map(p => p.componentId);
    const nextIndex = placedIds.length;
    return CORRECT_SEQUENCE[nextIndex] === componentId;
  }, [placedComponents]);

  // Get expected slot for component
  const getExpectedSlot = (componentId: string): { floor: string; slotId: string } | null => {
    for (const [floorKey, floor] of Object.entries(BUILDING_STRUCTURE)) {
      const slot = floor.slots.find(s => s.componentId === componentId);
      if (slot) return { floor: floorKey, slotId: slot.id };
    }
    return null;
  };

  // Error messages
  const getErrorMessage = useCallback((componentId: string) => {
    const comp = COMPONENTS.find(c => c.id === componentId);
    const messages: Record<string, string> = {
      "pump": "Start with the Pump on Floor 1 - it's the foundation of the plumbing system.",
      "water-supply": "Install Water Supply on Floor 1 after the Pump is running.",
      "electrical-panel": "The Electrical Panel on Floor 2 needs the ground floor systems first.",
      "lighting": "Lighting requires the Electrical Panel to be installed first.",
      "water-tank": "Water Tank goes on the Roof - needs the pump system ready first.",
      "cooling-unit": "Cooling Unit is the final rooftop component.",
    };
    return messages[componentId] || `Install ${comp?.name} in the correct order.`;
  }, []);

  // Handle drop
  const handleDrop = useCallback((slotId: string, floor: string) => {
    if (!draggingComponent) return;

    const expectedSlot = getExpectedSlot(draggingComponent);
    
    // Check if correct sequence
    if (!isCorrectNext(draggingComponent)) {
      setWrongAttempts(prev => prev + 1);
      setLastFault("sequence");
      setTimeout(() => { setLastFault(null); }, 3000);
      
      if (wrongAttempts >= 2) {
        setHintMessage(getErrorMessage(draggingComponent));
        setShowHint(true);
      }
      setDraggingComponent(null);
      return;
    }

    // Check if correct slot
    if (!expectedSlot || expectedSlot.slotId !== slotId) {
      setWrongAttempts(prev => prev + 1);
      setLastFault("wrong-slot");
      setTimeout(() => { setLastFault(null); }, 3000);
      setDraggingComponent(null);
      return;
    }

    setLastFault(null);

    const newComponent: PlacedComponent = {
      id: `placed-${Date.now()}`,
      componentId: draggingComponent,
      slotId: slotId,
      floor: floor,
    };

    setPlacedComponents(prev => [...prev, newComponent]);
    setDraggingComponent(null);
    setWrongAttempts(0);
  }, [draggingComponent, isCorrectNext, getErrorMessage, wrongAttempts]);

  // Drag handlers
  const handleDragStart = (componentId: string) => {
    if (placedComponents.some(p => p.componentId === componentId)) return;
    setDraggingComponent(componentId);
  };

  const handleDragEnd = () => setDraggingComponent(null);

  // Live score calculation (for display during game)
  const liveScore = useMemo(() => {
    const placementProgress = (placedComponents.length / CORRECT_SEQUENCE.length) * 4;
    const timeBonus = timeLeft > 60 ? 2 : timeLeft > 30 ? 1 : 0;
    const penalty = wrongAttempts * 0.25;
    const eventBonus = (eventScore / 6) * 4;
    return Math.min(10, Math.max(0, placementProgress + timeBonus + eventBonus - penalty));
  }, [placedComponents.length, wrongAttempts, timeLeft, eventScore]);

  // Tutorial handlers
  const handleNextTutorial = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleSkipTutorial = () => setShowTutorial(false);

  // Check if slot is filled
  const isSlotFilled = (slotId: string) => placedComponents.some(p => p.slotId === slotId);

  // Render improved building cross-section
  const renderBuildingCrossSection = () => {
    const floors = [
      { key: "roof", data: BUILDING_STRUCTURE.roof, label: "ROOF", icon: "roof" },
      { key: "floor2", data: BUILDING_STRUCTURE.floor2, label: "L2", icon: "floor" },
      { key: "floor1", data: BUILDING_STRUCTURE.floor1, label: "L1", icon: "floor" },
    ];

    return (
      <div className="relative">
        {/* Building frame SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          {/* Vertical pipes on left side */}
          <line x1="8%" y1="10%" x2="8%" y2="95%" stroke={COLORS.blue} strokeWidth="3" opacity="0.4" />
          <line x1="6%" y1="10%" x2="6%" y2="95%" stroke={COLORS.amber} strokeWidth="2" opacity="0.3" strokeDasharray="4 4" />
          {/* Vertical pipes on right side */}
          <line x1="92%" y1="10%" x2="92%" y2="95%" stroke={COLORS.blue} strokeWidth="3" opacity="0.4" />
          <line x1="94%" y1="10%" x2="94%" y2="95%" stroke={COLORS.amber} strokeWidth="2" opacity="0.3" strokeDasharray="4 4" />
        </svg>

        {floors.map((floor, idx) => {
          const floorIndex = floor.key === "floor1" ? 0 : floor.key === "floor2" ? 1 : 2;
          const isUnlocked = placedComponents.length >= floorIndex * 2;
          const isRoof = floor.key === "roof";
          
          return (
            <motion.div
              key={floor.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className="relative"
              style={{
                background: isRoof 
                  ? `linear-gradient(180deg, ${COLORS.teal}15 0%, transparent 100%)`
                  : isUnlocked ? `${floor.data.color}05` : 'transparent',
              }}
            >
              {/* Floor separator with structural beam effect */}
              {idx > 0 && (
                <div className="relative h-3" style={{ background: `${COLORS.deepGreen}` }}>
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${COLORS.glassBorder}, ${floor.data.color}40, ${COLORS.glassBorder})` }} />
                  <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: COLORS.glassBorder }} />
                  {/* Horizontal beam markers */}
                  <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: floor.data.color, opacity: 0.5 }} />
                  <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: floor.data.color, opacity: 0.5 }} />
                  <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: floor.data.color, opacity: 0.5 }} />
                </div>
              )}

              {/* Roof triangular top */}
              {isRoof && (
                <div className="relative h-8 overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <polygon points="50,0 100,20 0,20" fill={`${COLORS.teal}20`} stroke={COLORS.teal} strokeWidth="0.5" />
                    <line x1="50" y1="0" x2="50" y2="20" stroke={COLORS.teal} strokeWidth="0.3" opacity="0.5" />
                  </svg>
                </div>
              )}

              <div className="flex">
                {/* Floor label column */}
                <div 
                  className="w-12 md:w-16 flex-shrink-0 flex flex-col items-center justify-center py-4 border-r"
                  style={{ borderColor: `${floor.data.color}30` }}
                >
                  <span 
                    className="text-[10px] md:text-xs font-black tracking-tight writing-mode-vertical"
                    style={{ 
                      color: isUnlocked ? floor.data.color : `${floor.data.color}40`,
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {floor.label}
                  </span>
                  {!isUnlocked && (
                    <svg className="w-3 h-3 mt-2" viewBox="0 0 24 24" fill="none" stroke={`${COLORS.coolWhite}30`} strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>

                {/* Main floor content area */}
                <div className="flex-1 p-3 md:p-4">
                  {/* Room outline with slots */}
                  <div 
                    className="relative rounded-lg p-2 md:p-3"
                    style={{ 
                      background: COLORS.glass,
                      border: `1px solid ${isUnlocked ? floor.data.color : COLORS.glassBorder}30`,
                    }}
                  >
                    {/* Room interior walls hint */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4" style={{ background: `${COLORS.glassBorder}` }} />
                    
                    {/* Slots grid */}
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      {floor.data.slots.map((slot, slotIdx) => {
                        const isSlotActive = isSlotFilled(slot.id);
                        const isLeft = slotIdx === 0;
                        
                        return (
                          <div
                            key={slot.id}
                            onDragOver={(e) => isUnlocked && e.preventDefault()}
                            onDrop={() => isUnlocked && handleDrop(slot.id, floor.key)}
                            className={`
                              relative rounded-lg transition-all duration-300 flex items-center justify-center
                              ${isSlotActive ? '' : isUnlocked ? 'border-2 border-dashed hover:border-solid hover:scale-[1.02]' : 'opacity-30'}
                            `}
                            style={{
                              borderColor: isSlotActive ? 'transparent' : `${floor.data.color}50`,
                              background: isSlotActive 
                                ? `linear-gradient(135deg, ${floor.data.color}20, ${floor.data.color}10)`
                                : `${COLORS.glass}`,
                              minHeight: isMobile ? 60 : 80,
                              cursor: isUnlocked && !isSlotActive ? 'pointer' : 'default',
                            }}
                          >
                            {isSlotActive ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="flex items-center justify-center"
                              >
                                <ComponentIcon componentId={slot.componentId} size={isMobile ? 36 : 50} />
                              </motion.div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <div 
                                  className="w-8 h-8 md:w-10 md:h-10 rounded border-2 border-dashed flex items-center justify-center"
                                  style={{ borderColor: `${floor.data.color}30` }}
                                >
                                  <span className="text-lg md:text-xl" style={{ color: `${floor.data.color}30` }}>?</span>
                                </div>
                                {isUnlocked && (
                                  <span className="text-[8px] md:text-[9px] uppercase tracking-wider" style={{ color: `${floor.data.color}40` }}>
                                    {isLeft ? 'Slot A' : 'Slot B'}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Connection dots */}
                            {isSlotActive && (
                              <>
                                <div className="absolute -left-1 top-1/2 w-2 h-2 rounded-full" style={{ background: COLORS.blue, boxShadow: `0 0 6px ${COLORS.blue}` }} />
                                <div className="absolute -right-1 top-1/2 w-2 h-2 rounded-full" style={{ background: COLORS.amber, boxShadow: `0 0 6px ${COLORS.amber}` }} />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side - MEP shaft indicator */}
                <div 
                  className="w-8 md:w-10 flex-shrink-0 flex flex-col items-center justify-center border-l"
                  style={{ borderColor: `${floor.data.color}20` }}
                >
                  {/* Pipe indicators */}
                  <div className="flex flex-col gap-1">
                    <div className="w-1.5 h-6 rounded-full" style={{ background: placedComponents.length > floorIndex * 2 ? COLORS.blue : `${COLORS.blue}30` }} />
                    <div className="w-1.5 h-6 rounded-full" style={{ background: placedComponents.length > floorIndex * 2 ? COLORS.amber : `${COLORS.amber}30` }} />
                    <div className="w-1.5 h-6 rounded-full" style={{ background: placedComponents.length > floorIndex * 2 ? COLORS.emerald : `${COLORS.emerald}30` }} />
                  </div>
                </div>
              </div>

              {/* Ground/foundation for floor 1 */}
              {floor.key === "floor1" && (
                <div className="relative h-4" style={{ background: `linear-gradient(180deg, ${COLORS.deepGreen}, ${COLORS.darkGreen})` }}>
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `${COLORS.glassBorder}` }} />
                  {/* Foundation markers */}
                  {[20, 40, 60, 80].map(pos => (
                    <div key={pos} className="absolute top-1 w-1 h-2" style={{ left: `${pos}%`, background: `${COLORS.coolWhite}20` }} />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col" style={{ 
      background: `linear-gradient(135deg, ${COLORS.deepGreen} 0%, ${COLORS.darkGreen} 100%)`,
    }}>
      
      {/* Background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="mepGridBg" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke={COLORS.emerald} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mepGridBg)" />
        </svg>
      </div>

      {/* HEADER */}
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between relative z-20 gap-2"
        style={{ 
          background: COLORS.glass,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${COLORS.glassBorder}`,
        }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <div 
            className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.emerald}40, ${COLORS.teal}40)`,
              border: `1px solid ${COLORS.emerald}50`,
            }}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-xl font-bold" style={{ color: COLORS.coolWhite }}>
              MEP Systems Builder
            </h1>
            <p className="text-[10px] md:text-xs flex items-center gap-2" style={{ color: `${COLORS.coolWhite}70` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.emerald }}></span>
              Engineer: <strong>{userName}</strong>
            </p>
          </div>
        </div>

        {/* Mobile stats */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-lg" style={{ background: COLORS.glass }}>
              <span className="font-mono text-sm font-bold" style={{ color: COLORS.coolWhite }}>{formatTime(timeLeft)}</span>
            </div>
            <div className="px-2 py-1 rounded-lg" style={{ background: COLORS.glass }}>
              <span className="text-sm font-bold" style={{ color: COLORS.emerald }}>{placedComponents.length}/6</span>
            </div>
          </div>
        )}

        <button
          onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
          className="px-3 py-1.5 rounded-lg flex items-center gap-1"
          style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
        >
          <span className="text-sm" style={{ color: COLORS.emerald }}>?</span>
        </button>
      </motion.header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
        
        {/* LEFT - Component Toolbox */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex w-64 flex-col rounded-2xl overflow-hidden"
          style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
        >
          <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <h2 className="text-base font-bold" style={{ color: COLORS.coolWhite }}>Components</h2>
            <p className="text-[11px]" style={{ color: `${COLORS.coolWhite}60` }}>Drag to building slots</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {shuffledComponents.map((comp, i) => {
              const isPlaced = placedComponents.some(p => p.componentId === comp.id);
              const typeColor = getTypeColor(comp.type);
              
              return (
                <motion.div
                  key={comp.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  draggable={!isPlaced}
                  onDragStart={() => handleDragStart(comp.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-2 rounded-xl flex items-center gap-3 transition-all ${
                    isPlaced ? 'opacity-40' : 'cursor-grab active:cursor-grabbing hover:translate-x-1'
                  }`}
                  style={{ 
                    background: isPlaced ? `${typeColor}10` : COLORS.glass,
                    border: `1px solid ${isPlaced ? typeColor : COLORS.glassBorder}`,
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${typeColor}15` }}>
                    {isPlaced ? (
                      <svg className="w-5 h-5" fill="none" stroke={typeColor} strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <ComponentIcon componentId={comp.id} size={32} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: isPlaced ? `${COLORS.coolWhite}50` : COLORS.coolWhite }}>
                      {comp.name}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CENTER - Building */}
        <div 
          ref={canvasRef}
          className="flex-1 flex flex-col rounded-2xl overflow-hidden relative pb-20 md:pb-0"
          style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
        >
          {/* Building visualization */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            <div 
              className="rounded-xl overflow-hidden"
              style={{ 
                background: COLORS.deepGreen,
                border: `2px solid ${COLORS.emerald}30`,
                boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
              }}
            >
              {/* Building header */}
              <div 
                className="px-4 py-2 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${COLORS.emerald}15, ${COLORS.teal}10)`, borderBottom: `1px solid ${COLORS.emerald}30` }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.emerald }}>
                      Building Section
                    </span>
                    <p className="text-[9px]" style={{ color: `${COLORS.coolWhite}50` }}>Drag components to slots</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase" style={{ color: `${COLORS.coolWhite}40` }}>Systems</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.glass }}>
                        <motion.div 
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${buildingPower}%` }}
                          style={{ background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.amber}, ${COLORS.emerald})` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums" style={{ color: COLORS.emerald }}>{Math.round(buildingPower)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Improved Building Cross-Section */}
              {renderBuildingCrossSection()}
            </div>
          </div>

          {/* Fault indicator */}
          <AnimatePresence>
            {lastFault && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 right-4 px-4 py-2 rounded-xl flex items-center gap-2"
                style={{ 
                  background: `${COLORS.red}20`,
                  border: `2px solid ${COLORS.red}`,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                </svg>
                <p className="text-xs font-bold" style={{ color: COLORS.red }}>
                  {lastFault === "sequence" ? "Wrong Order!" : "Wrong Slot!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT - Status Panel */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex w-72 flex-col rounded-2xl overflow-hidden"
          style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
        >
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <h2 className="text-base font-bold" style={{ color: COLORS.coolWhite }}>Status</h2>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: `${COLORS.emerald}20`, color: COLORS.emerald }}>
              Step {gameStep}/5
            </span>
          </div>

          {/* Current Step Indicator */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  className="flex-1 h-1.5 rounded-full transition-all"
                  style={{
                    background: step < gameStep ? COLORS.emerald : step === gameStep ? COLORS.amber : COLORS.glass,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-center" style={{ color: `${COLORS.coolWhite}70` }}>
              {gameStep === 1 && "Install components"}
              {gameStep === 2 && "Ready to simulate"}
              {gameStep === 3 && "Systems powering up..."}
              {gameStep === 4 && `Event ${eventsCompleted + 1}/${totalEvents}`}
              {gameStep === 5 && "Complete!"}
            </p>
          </div>

          {/* Timer & Score */}
          <div className="p-4 grid grid-cols-2 gap-3" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <div className="p-3 rounded-xl text-center" style={{ background: COLORS.glass }}>
              <p className="text-[10px] uppercase mb-1" style={{ color: `${COLORS.coolWhite}60` }}>Time</p>
              <p className="font-mono text-2xl font-bold" style={{ color: timeLeft < 30 ? COLORS.red : COLORS.coolWhite }}>{formatTime(timeLeft)}</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: COLORS.glass }}>
              <p className="text-[10px] uppercase mb-1" style={{ color: `${COLORS.coolWhite}60` }}>Score</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.emerald }}>{liveScore.toFixed(1)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <div className="flex justify-between mb-2">
              <span className="text-xs" style={{ color: COLORS.coolWhite }}>Components</span>
              <span className="text-xs font-bold" style={{ color: COLORS.emerald }}>{placedComponents.length}/6</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: COLORS.glass }}>
              <motion.div 
                className="h-full rounded-full"
                animate={{ width: `${(placedComponents.length / 6) * 100}%` }}
                style={{ background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.amber}, ${COLORS.emerald})` }}
              />
            </div>
          </div>

          {/* System status */}
          <div className="flex-1 p-4">
            <p className="text-xs font-bold mb-3" style={{ color: COLORS.coolWhite }}>Systems</p>
            <div className="flex flex-col gap-2">
              {[
                { name: "Plumbing", color: COLORS.blue, count: placedComponents.filter(p => ["pump", "water-supply", "water-tank"].includes(p.componentId)).length, total: 3 },
                { name: "Electrical", color: COLORS.amber, count: placedComponents.filter(p => ["electrical-panel", "lighting"].includes(p.componentId)).length, total: 2 },
                { name: "Mechanical", color: COLORS.emerald, count: placedComponents.filter(p => ["cooling-unit"].includes(p.componentId)).length, total: 1 },
              ].map(sys => (
                <div key={sys.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: sys.count === sys.total ? sys.color : `${sys.color}40` }} />
                  <span className="text-[11px] flex-1" style={{ color: `${COLORS.coolWhite}80` }}>{sys.name}</span>
                  <span className="text-[10px] font-bold" style={{ color: sys.color }}>{sys.count}/{sys.total}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* MOBILE TOOLBAR */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-5"
          style={{ background: COLORS.glass, backdropFilter: 'blur(20px)', borderTop: `1px solid ${COLORS.emerald}40` }}
        >
          <div className="flex items-center gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {shuffledComponents.map(comp => {
              const isPlaced = placedComponents.some(p => p.componentId === comp.id);
              const typeColor = getTypeColor(comp.type);
              return (
                <motion.div
                  key={comp.id}
                  draggable={!isPlaced && gameStep === 1}
                  onDragStart={() => handleDragStart(comp.id)}
                  className={`flex-shrink-0 p-2.5 rounded-2xl flex flex-col items-center ${isPlaced ? 'opacity-40' : ''}`}
                  style={{ background: COLORS.glass, border: `2px solid ${isPlaced ? typeColor : COLORS.glassBorder}`, minWidth: 90 }}
                >
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: `${typeColor}20` }}>
                    {isPlaced ? (
                      <svg className="w-7 h-7" fill="none" stroke={typeColor} strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <ComponentIcon componentId={comp.id} size={36} />
                    )}
                  </div>
                  <span className="text-xs font-bold mt-2 text-center leading-tight" style={{ color: `${COLORS.coolWhite}90` }}>
                    {comp.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* TUTORIAL */}
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${COLORS.emerald}20` }}>
                {TUTORIAL_STEPS[tutorialStep].icon === "welcome" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "building" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                    <path d="M2 20h20M4 20V8l8-5 8 5v12M8 20v-4h8v4M8 11h.01M16 11h.01M12 11h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "components" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" fill={`${COLORS.emerald}30`} />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "events" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "start" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              
              <div className="flex justify-center gap-1 mb-4">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === tutorialStep ? COLORS.emerald : `${COLORS.coolWhite}30` }} />
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.coolWhite }}>{TUTORIAL_STEPS[tutorialStep].title}</h3>
              <p className="text-sm mb-6" style={{ color: `${COLORS.coolWhite}80` }}>{TUTORIAL_STEPS[tutorialStep].description}</p>
              
              <div className="flex gap-3 justify-center">
                <button onClick={handleSkipTutorial} className="px-4 py-2 rounded-xl" style={{ background: COLORS.glass, color: `${COLORS.coolWhite}80` }}>
                  Skip
                </button>
                <button onClick={handleNextTutorial} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.emerald, color: COLORS.deepGreen }}>
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(20px)', border: `1px solid ${COLORS.emerald}50` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.amber}20` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                  <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.amber }}>Hint</h3>
              <p className="text-sm mb-4" style={{ color: COLORS.coolWhite }}>{hintMessage}</p>
              <button onClick={() => setShowHint(false)} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.emerald, color: COLORS.deepGreen }}>
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.emerald}50` }}
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: `${COLORS.emerald}20` }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.coolWhite }}>All Components Installed!</h2>
              <p className="text-sm mb-6" style={{ color: `${COLORS.coolWhite}70` }}>
                Ready to power up the building systems. Start the simulation to test your installation.
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="p-2 rounded-lg" style={{ background: `${COLORS.blue}20` }}>
                  <div className="w-6 h-6 mx-auto mb-1 rounded flex items-center justify-center" style={{ background: `${COLORS.blue}30` }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="2">
                      <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66 4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24" />
                    </svg>
                  </div>
                  <p className="text-[9px] uppercase" style={{ color: COLORS.blue }}>Plumbing</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: `${COLORS.amber}20` }}>
                  <div className="w-6 h-6 mx-auto mb-1 rounded flex items-center justify-center" style={{ background: `${COLORS.amber}30` }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <p className="text-[9px] uppercase" style={{ color: COLORS.amber }}>Electrical</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: `${COLORS.emerald}20` }}>
                  <div className="w-6 h-6 mx-auto mb-1 rounded flex items-center justify-center" style={{ background: `${COLORS.emerald}30` }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                    </svg>
                  </div>
                  <p className="text-[9px] uppercase" style={{ color: COLORS.emerald }}>Mechanical</p>
                </div>
              </div>
              
              <motion.button 
                onClick={handleStartSimulation}
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto"
                style={{ background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.teal})`, color: COLORS.deepGreen }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Simulation
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3: SYSTEMS POWERING UP OVERLAY */}
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
              className="relative z-10 max-w-md w-full p-8 rounded-3xl"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.emerald}50` }}
            >
              <h2 className="text-xl font-bold mb-6 text-center" style={{ color: COLORS.coolWhite }}>
                Powering Up Systems...
              </h2>
              
              {/* Progress bar */}
              <div className="h-3 rounded-full overflow-hidden mb-6" style={{ background: COLORS.glass }}>
                <motion.div 
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${simulationProgress}%` }}
                  style={{ background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.amber}, ${COLORS.emerald})` }}
                />
              </div>
              
              {/* System status list */}
              <div className="space-y-3">
                {COMPONENTS.map((comp) => {
                  const isActive = activeSystems.includes(comp.id);
                  const typeColor = getTypeColor(comp.type);
                  return (
                    <motion.div 
                      key={comp.id}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: isActive ? 1 : 0.3 }}
                      className="flex items-center gap-3 p-2 rounded-lg"
                      style={{ background: isActive ? `${typeColor}15` : 'transparent' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: isActive ? typeColor : COLORS.glass }}
                      >
                        {isActive ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke={COLORS.deepGreen} strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: `${COLORS.coolWhite}30` }} />
                        )}
                      </div>
                      <span className="text-sm font-medium" style={{ color: isActive ? typeColor : `${COLORS.coolWhite}50` }}>
                        {comp.name}
                      </span>
                      {isActive && (
                        <span className="ml-auto text-[10px] uppercase px-2 py-0.5 rounded" style={{ background: `${typeColor}30`, color: typeColor }}>
                          Online
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

      {/* STEP 4: EVENTS OVERLAY */}
      <AnimatePresence>
        {gameStep === 4 && currentEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/85" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-10 max-w-lg w-full p-6 rounded-3xl"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `2px solid ${currentEvent.type === 'surge' ? COLORS.amber : currentEvent.type === 'leak' ? COLORS.blue : currentEvent.type === 'overload' ? COLORS.red : COLORS.emerald}50` }}
            >
              {/* Event header */}
              <div className="flex items-start gap-4 mb-4">
                <motion.div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${currentEvent.type === 'surge' ? COLORS.amber : currentEvent.type === 'leak' ? COLORS.blue : currentEvent.type === 'overload' ? COLORS.red : COLORS.emerald}20` }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {currentEvent.type === 'demand' && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="1.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {currentEvent.type === 'surge' && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {currentEvent.type === 'leak' && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="1.5">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {currentEvent.type === 'overload' && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="1.5">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                    </svg>
                  )}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold" style={{ 
                      background: `${currentEvent.type === 'surge' ? COLORS.amber : currentEvent.type === 'leak' ? COLORS.blue : currentEvent.type === 'overload' ? COLORS.red : COLORS.emerald}30`,
                      color: currentEvent.type === 'surge' ? COLORS.amber : currentEvent.type === 'leak' ? COLORS.blue : currentEvent.type === 'overload' ? COLORS.red : COLORS.emerald,
                    }}>
                      {currentEvent.type}
                    </span>
                    <span className="text-[10px]" style={{ color: `${COLORS.coolWhite}50` }}>Event {eventsCompleted + 1}/{totalEvents}</span>
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: COLORS.coolWhite }}>{currentEvent.title}</h3>
                </div>
              </div>
              
              <p className="text-sm mb-6 p-3 rounded-lg" style={{ background: COLORS.glass, color: `${COLORS.coolWhite}80` }}>
                {currentEvent.description}
              </p>
              
              {/* Response options */}
              {!eventFeedback ? (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase mb-2 font-bold" style={{ color: `${COLORS.coolWhite}50` }}>Select your response:</p>
                  {currentEvent.options.map((option, i) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleEventResponse(option.id)}
                      className="w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all"
                      style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
                      whileHover={{ scale: 1.01, background: `${COLORS.emerald}10` }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: COLORS.glass, color: COLORS.coolWhite }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm" style={{ color: COLORS.coolWhite }}>{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: eventFeedback.correct ? `${COLORS.emerald}20` : `${COLORS.amber}20` }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: eventFeedback.correct ? COLORS.emerald : COLORS.amber }}>
                    {eventFeedback.correct ? (
                      <svg className="w-6 h-6" fill="none" stroke={COLORS.deepGreen} strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke={COLORS.deepGreen} strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </div>
                  <p className="font-bold" style={{ color: eventFeedback.correct ? COLORS.emerald : COLORS.amber }}>{eventFeedback.message}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 5: FINAL SCORE OVERLAY */}
      <AnimatePresence>
        {gameStep === 5 && scoreBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-black/90" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-10 max-w-md w-full p-6 rounded-3xl my-4"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.emerald}50` }}
            >
              {/* Grade badge */}
              <motion.div 
                className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${COLORS.emerald}30, ${COLORS.teal}30)` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-5xl font-black" style={{ color: COLORS.emerald }}>{scoreBreakdown.grade}</span>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-center mb-1" style={{ color: COLORS.coolWhite }}>
                Simulation Complete!
              </h2>
              <p className="text-center mb-6" style={{ color: `${COLORS.coolWhite}60` }}>
                Building Systems Assessment
              </p>
              
              {/* Total Score */}
              <div className="p-4 rounded-xl mb-4 text-center" style={{ background: `${COLORS.emerald}15` }}>
                <p className="text-4xl font-black" style={{ color: COLORS.emerald }}>{scoreBreakdown.total.toFixed(1)}<span className="text-xl">/10</span></p>
                <p className="text-xs uppercase mt-1" style={{ color: `${COLORS.coolWhite}60` }}>Total Score</p>
              </div>
              
              {/* Score Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.glass }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.blue}20` }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="2">
                        <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: COLORS.coolWhite }}>Installation</span>
                  </div>
                  <span className="font-bold" style={{ color: COLORS.blue }}>{scoreBreakdown.placement.toFixed(1)}/4</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.glass }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.amber}20` }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: COLORS.coolWhite }}>Time Bonus</span>
                  </div>
                  <span className="font-bold" style={{ color: COLORS.amber }}>{scoreBreakdown.time.toFixed(1)}/2</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.glass }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.emerald}20` }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={COLORS.emerald} strokeWidth="2">
                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: COLORS.coolWhite }}>Event Response</span>
                  </div>
                  <span className="font-bold" style={{ color: COLORS.emerald }}>{scoreBreakdown.events.toFixed(1)}/4</span>
                </div>
              </div>
              
              {/* Feedback */}
              <div className="p-4 rounded-xl mb-6" style={{ background: COLORS.glass }}>
                <p className="text-xs uppercase mb-2 font-bold" style={{ color: `${COLORS.coolWhite}50` }}>Expert Feedback</p>
                <ul className="space-y-1">
                  {scoreBreakdown.feedback.map((fb, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: `${COLORS.coolWhite}80` }}>
                      <span style={{ color: COLORS.emerald }}>•</span>
                      {fb}
                    </li>
                  ))}
                </ul>
              </div>
              
              <motion.button 
                onClick={() => setShowThankYou(true)}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.teal})`, color: COLORS.deepGreen }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue →
              </motion.button>
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
        onComplete={() => { onComplete?.(scoreBreakdown?.total || 0, timeLeft); onExit?.(); }}
      />
    </div>
  );
}
