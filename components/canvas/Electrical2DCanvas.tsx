"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThankYouOverlay from "./ThankYouOverlay";
import { saveScoreWithBackup } from "@/lib/utils";

// Electrical Power System Color Palette
const COLORS = {
  amber: "#F59E0B",
  yellow: "#EAB308",
  orange: "#F97316",
  darkAmber: "#78350F",
  deepAmber: "#451A03",
  red: "#EF4444",
  green: "#22C55E",
  blue: "#3B82F6",
  coolWhite: "#FFFBEB",
  glass: "rgba(255, 255, 255, 0.08)",
  glassLight: "rgba(255, 255, 255, 0.12)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
};

// Power system structure with slots
const POWER_SYSTEM = {
  supply: {
    name: "Power Supply",
    slots: [
      { id: "supply-1", componentId: "transformer", label: "Transformer" },
    ],
  },
  loads: {
    name: "Industrial Loads",
    slots: [
      { id: "load-1", componentId: "motor-load", label: "Motor Load" },
      { id: "load-2", componentId: "hvac-load", label: "HVAC Load" },
      { id: "load-3", componentId: "variable-load", label: "Variable Load" },
    ],
  },
  optimization: {
    name: "Power Quality",
    slots: [
      { id: "opt-1", componentId: "capacitor-bank", label: "Capacitor Bank" },
      { id: "opt-2", componentId: "harmonic-filter", label: "Harmonic Filter" },
      { id: "opt-3", componentId: "power-meter", label: "Power Meter" },
    ],
  },
};

// Electrical Components
const COMPONENTS = [
  { id: "transformer", name: "Transformer", section: "supply", description: "Grid power supply" },
  { id: "motor-load", name: "Motor Load", section: "loads", description: "Inductive motor load" },
  { id: "hvac-load", name: "HVAC Load", section: "loads", description: "HVAC system load" },
  { id: "variable-load", name: "Variable Load", section: "loads", description: "Random demand spikes" },
  { id: "capacitor-bank", name: "Capacitor Bank", section: "optimization", description: "Reactive compensation" },
  { id: "harmonic-filter", name: "Harmonic Filter", section: "optimization", description: "THD reduction" },
  { id: "power-meter", name: "Power Meter", section: "optimization", description: "Power quality monitoring" },
];

// Correct installation sequence: Supply → Loads → Optimization
const CORRECT_SEQUENCE = [
  "transformer", 
  "motor-load", 
  "hvac-load", 
  "variable-load", 
  "capacitor-bank", 
  "harmonic-filter", 
  "power-meter"
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

// ============ ELECTRICAL COMPONENT ICONS ============

function TransformerIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x="10" y="15" width="40" height="30" rx="3" fill={COLORS.deepAmber} stroke={COLORS.amber} strokeWidth="2" />
      {/* Primary coil */}
      <path d="M18 20 Q18 25 22 25 Q18 25 18 30 Q18 35 22 35 Q18 35 18 40" 
        fill="none" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round" />
      {/* Secondary coil */}
      <path d="M42 20 Q42 25 38 25 Q42 25 42 30 Q42 35 38 35 Q42 35 42 40" 
        fill="none" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round" />
      {/* Core */}
      <rect x="26" y="18" width="8" height="24" fill={COLORS.amber} opacity="0.3" />
      {/* Connection points */}
      <circle cx="18" cy="15" r="3" fill={COLORS.amber} />
      <circle cx="18" cy="45" r="3" fill={COLORS.amber} />
      <circle cx="42" cy="15" r="3" fill={COLORS.amber} />
      <circle cx="42" cy="45" r="3" fill={COLORS.amber} />
    </svg>
  );
}

function MotorLoadIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="20" fill={COLORS.deepAmber} stroke={COLORS.amber} strokeWidth="2" />
      <circle cx="30" cy="30" r="12" fill={COLORS.amber} opacity="0.2" />
      {/* Motor symbol M */}
      <text x="30" y="35" textAnchor="middle" fill={COLORS.amber} fontSize="16" fontWeight="bold">M</text>
      {/* Rotation indicator */}
      <path d="M30 14 L34 10 L30 6" fill="none" stroke={COLORS.amber} strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="2s" repeatCount="indefinite" />
      </path>
      {/* Connection */}
      <rect x="48" y="27" width="8" height="6" fill={COLORS.amber} />
    </svg>
  );
}

function HVACLoadIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x="12" y="18" width="36" height="24" rx="3" fill={COLORS.deepAmber} stroke={COLORS.amber} strokeWidth="2" />
      {/* Fan blades */}
      <g>
        <ellipse cx="30" cy="30" rx="8" ry="3" fill={COLORS.amber} opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="30" cy="30" rx="3" ry="8" fill={COLORS.amber} opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
      </g>
      <circle cx="30" cy="30" r="3" fill={COLORS.amber} />
      {/* Vents */}
      <line x1="14" y1="22" x2="46" y2="22" stroke={COLORS.amber} strokeWidth="1" opacity="0.5" />
      <line x1="14" y1="38" x2="46" y2="38" stroke={COLORS.amber} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function VariableLoadIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x="12" y="15" width="36" height="30" rx="3" fill={COLORS.deepAmber} stroke={COLORS.amber} strokeWidth="2" />
      {/* Random spike graph */}
      <polyline 
        points="16,38 22,32 26,36 32,24 38,30 44,22" 
        fill="none" 
        stroke={COLORS.amber} 
        strokeWidth="2" 
        strokeLinecap="round"
      >
        <animate attributeName="points" 
          values="16,38 22,32 26,36 32,24 38,30 44,22;16,34 22,38 26,28 32,32 38,24 44,30;16,38 22,32 26,36 32,24 38,30 44,22" 
          dur="2s" repeatCount="indefinite" />
      </polyline>
      {/* Arrow indicator */}
      <path d="M30 48 L26 52 L34 52 Z" fill={COLORS.amber} opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function CapacitorBankIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Capacitor symbols in bank */}
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${i * 14}, 0)`}>
          <line x1={16} y1="18" x2={16} y2="42" stroke={COLORS.amber} strokeWidth="1" />
          <line x1={12} y1="26" x2={20} y2="26" stroke={COLORS.amber} strokeWidth="3" />
          <line x1={12} y1="34" x2={20} y2="34" stroke={COLORS.amber} strokeWidth="3" />
          <rect x={13} y="28" width={6} height="4" fill={COLORS.amber} opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      {/* Connection bus */}
      <rect x="10" y="14" width="40" height="3" fill={COLORS.amber} />
      <rect x="10" y="43" width="40" height="3" fill={COLORS.amber} />
    </svg>
  );
}

function HarmonicFilterIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x="12" y="12" width="36" height="36" rx="4" fill={COLORS.deepAmber} stroke={COLORS.amber} strokeWidth="2" />
      {/* Sine wave being filtered */}
      <path d="M18 30 Q24 20 30 30 Q36 40 42 30" fill="none" stroke={COLORS.amber} strokeWidth="2" opacity="0.4" />
      {/* Clean sine wave */}
      <path d="M18 30 Q24 24 30 30 Q36 36 42 30" fill="none" stroke={COLORS.amber} strokeWidth="2.5">
        <animate attributeName="stroke-dashoffset" from="50" to="0" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Filter symbol */}
      <polygon points="26,42 30,46 34,42" fill={COLORS.amber} opacity="0.6" />
      <line x1="30" y1="36" x2="30" y2="42" stroke={COLORS.amber} strokeWidth="2" />
    </svg>
  );
}

function PowerMeterIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect x="10" y="10" width="40" height="40" rx="4" fill={COLORS.deepAmber} stroke={COLORS.amber} strokeWidth="2" />
      {/* Display */}
      <rect x="14" y="14" width="32" height="18" rx="2" fill={COLORS.amber} opacity="0.2" />
      {/* PF reading */}
      <text x="30" y="28" textAnchor="middle" fill={COLORS.amber} fontSize="10" fontWeight="bold">0.95</text>
      {/* Indicator LEDs */}
      <circle cx="18" cy="40" r="3" fill={COLORS.green}>
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="40" r="3" fill={COLORS.amber} />
      <circle cx="42" cy="40" r="3" fill={COLORS.red} opacity="0.3" />
      {/* Label */}
      <text x="30" y="48" textAnchor="middle" fill={COLORS.amber} fontSize="6" opacity="0.7">PF METER</text>
    </svg>
  );
}

// Component icon renderer
function ComponentIcon({ componentId, size = 60 }: { componentId: string; size?: number }) {
  switch (componentId) {
    case "transformer": return <TransformerIcon size={size} />;
    case "motor-load": return <MotorLoadIcon size={size} />;
    case "hvac-load": return <HVACLoadIcon size={size} />;
    case "variable-load": return <VariableLoadIcon size={size} />;
    case "capacitor-bank": return <CapacitorBankIcon size={size} />;
    case "harmonic-filter": return <HarmonicFilterIcon size={size} />;
    case "power-meter": return <PowerMeterIcon size={size} />;
    default: return null;
  }
}

// ============ EVENTS FOR STEP 4 ============

const EVENTS = [
  {
    id: "pf-drop",
    title: "Power Factor Drop!",
    description: "Motor startup causing reactive power surge. PF dropped to 0.82. How do you respond?",
    icon: "warning",
    options: [
      { id: "a", text: "Increase capacitor bank output", correct: true, points: 2 },
      { id: "b", text: "Disconnect variable loads", correct: false, points: 1 },
      { id: "c", text: "Wait for automatic correction", correct: false, points: 0 },
    ],
  },
  {
    id: "harmonic-spike",
    title: "Harmonic Distortion Alert!",
    description: "THD spiked to 12% due to VFD operation. System efficiency dropping.",
    icon: "alert",
    options: [
      { id: "a", text: "Activate harmonic filter tuning", correct: true, points: 2 },
      { id: "b", text: "Reduce motor speed", correct: false, points: 1 },
      { id: "c", text: "Ignore - within tolerance", correct: false, points: 0 },
    ],
  },
  {
    id: "demand-peak",
    title: "Peak Demand Warning!",
    description: "Approaching maximum demand threshold. Risk of demand charges.",
    icon: "peak",
    options: [
      { id: "a", text: "Shed non-critical loads temporarily", correct: true, points: 2 },
      { id: "b", text: "Increase transformer tap", correct: false, points: 0 },
      { id: "c", text: "Switch to backup power", correct: false, points: 1 },
    ],
  },
  {
    id: "voltage-sag",
    title: "Voltage Sag Detected!",
    description: "Grid voltage dropped 8%. Equipment sensitive to under-voltage.",
    icon: "voltage",
    options: [
      { id: "a", text: "Adjust transformer tap changer", correct: true, points: 2 },
      { id: "b", text: "Disconnect sensitive loads", correct: false, points: 1 },
      { id: "c", text: "Add more capacitors", correct: false, points: 0 },
    ],
  },
];

// ============ MAIN CANVAS COMPONENT ============

interface Electrical2DCanvasProps {
  userName?: string;
  userPhone?: string;
  userSector?: string;
  isActive?: boolean;
  onComplete?: (score: number, timeLeft: number) => void;
  onExit?: () => void;
}

export default function Electrical2DCanvas({
  userName = "Engineer",
  userPhone = "",
  userSector = "Electrical",
  isActive = true,
  onExit,
}: Electrical2DCanvasProps) {
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
  
  // Power factor simulation
  const [powerFactor, setPowerFactor] = useState(0.75);
  const [thd, setThd] = useState(15); // Total Harmonic Distortion %
  const [systemEfficiency, setSystemEfficiency] = useState(0);
  
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
      title: "Power Quality Optimizer",
      description: "Design an electrical system that maintains Power Factor ≥ 0.95 while minimizing energy losses.",
      icon: "welcome",
    },
    {
      id: "step1",
      title: "Step 1: Install Components",
      description: "Place the transformer, industrial loads, and power quality equipment in the correct sequence.",
      icon: "building",
    },
    {
      id: "step2",
      title: "Step 2: Start Simulation",
      description: "Once all components are placed, energize the system to test power quality.",
      icon: "components",
    },
    {
      id: "step3",
      title: "Step 3-4: Handle Events",
      description: "Respond to power quality events: PF drops, harmonic spikes, and demand peaks.",
      icon: "events",
    },
    {
      id: "step5",
      title: "Step 5: Get Your Score",
      description: "Receive a detailed power quality assessment with expert feedback. Target PF: 0.95+",
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

  // Power factor simulation based on placed components
  useEffect(() => {
    const placedIds = placedComponents.map(p => p.componentId);
    let pf = 0.75; // Base PF with loads
    let harmonic = 15; // Base THD
    
    if (placedIds.includes("transformer")) pf += 0.02;
    if (placedIds.includes("capacitor-bank")) pf += 0.15;
    if (placedIds.includes("harmonic-filter")) {
      pf += 0.05;
      harmonic -= 8;
    }
    if (placedIds.includes("power-meter")) pf += 0.02;
    
    setPowerFactor(Math.min(0.99, pf));
    setThd(Math.max(3, harmonic));
    setSystemEfficiency((placedComponents.length / CORRECT_SEQUENCE.length) * 100);
  }, [placedComponents]);

  // Transition to Step 2 when all components placed
  useEffect(() => {
    if (placedComponents.length === CORRECT_SEQUENCE.length && gameStep === 1) {
      setGameStep(2);
    }
  }, [placedComponents.length, gameStep]);

  // Step 3: System energizing animation
  useEffect(() => {
    if (gameStep !== 3) return;
    
    const systemOrder = ["transformer", "motor-load", "hvac-load", "variable-load", "capacitor-bank", "harmonic-filter", "power-meter"];
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
    }, 600);
    
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
    if (wrongAttempts === 0) feedback.push("Perfect component installation!");
    else if (wrongAttempts <= 2) feedback.push("Good system configuration.");
    else feedback.push("Review electrical system design.");
    
    if (timeScore === 2) feedback.push("Excellent response time.");
    else if (timeScore === 1) feedback.push("Adequate timing.");
    else feedback.push("Work on efficiency.");
    
    if (eventScore >= 5) feedback.push("Outstanding power quality management!");
    else if (eventScore >= 3) feedback.push("Good event handling.");
    else feedback.push("Study power quality fundamentals.");
    
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
        ? "Excellent! Power quality stabilized." 
        : selectedOption.points > 0 
          ? "Partial solution. Could be optimized."
          : "Incorrect. System efficiency reduced.",
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
    for (const [section, data] of Object.entries(POWER_SYSTEM)) {
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
    
    if (!isCorrectNext(draggingComponent)) {
      setWrongAttempts(prev => prev + 1);
      setHintMessage("Install components in sequence: Supply → Loads → Optimization");
      setShowHint(true);
      setDraggingComponent(null);
      return;
    }
    
    if (!expectedSlot || expectedSlot.slotId !== slotId) {
      setWrongAttempts(prev => prev + 1);
      setHintMessage("This component belongs in a different slot.");
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

  // Render power system diagram
  const renderPowerSystemDiagram = () => {
    return (
      <div className="relative w-full h-full flex flex-col gap-4 p-4">
        {/* Power Supply Section */}
        <div 
          className="flex-shrink-0 p-4 rounded-2xl"
          style={{ background: `${COLORS.amber}10`, border: `1px solid ${COLORS.amber}30` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-sm font-bold" style={{ color: COLORS.amber }}>POWER SUPPLY</span>
          </div>
          <div className="flex justify-center">
            {POWER_SYSTEM.supply.slots.map(slot => (
              <div
                key={slot.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(slot.id, "supply")}
                className="w-24 h-24 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isSlotFilled(slot.id) ? `${COLORS.amber}20` : COLORS.glass,
                  border: `2px dashed ${isSlotFilled(slot.id) ? COLORS.amber : COLORS.glassBorder}`,
                }}
              >
                {isSlotFilled(slot.id) ? (
                  <ComponentIcon componentId={slot.componentId} size={56} />
                ) : (
                  <span className="text-2xl font-bold" style={{ color: `${COLORS.coolWhite}30` }}>?</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Industrial Loads Section */}
        <div 
          className="flex-1 p-4 rounded-2xl"
          style={{ background: `${COLORS.orange}10`, border: `1px solid ${COLORS.orange}30` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.orange} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm font-bold" style={{ color: COLORS.orange }}>INDUSTRIAL LOADS</span>
          </div>
          <div className="flex justify-around gap-2">
            {POWER_SYSTEM.loads.slots.map(slot => (
              <div
                key={slot.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(slot.id, "loads")}
                className="w-20 h-20 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isSlotFilled(slot.id) ? `${COLORS.orange}20` : COLORS.glass,
                  border: `2px dashed ${isSlotFilled(slot.id) ? COLORS.orange : COLORS.glassBorder}`,
                }}
              >
                {isSlotFilled(slot.id) ? (
                  <ComponentIcon componentId={slot.componentId} size={48} />
                ) : (
                  <span className="text-xl font-bold" style={{ color: `${COLORS.coolWhite}30` }}>?</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Power Quality Section */}
        <div 
          className="flex-shrink-0 p-4 rounded-2xl"
          style={{ background: `${COLORS.green}10`, border: `1px solid ${COLORS.green}30` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-sm font-bold" style={{ color: COLORS.green }}>POWER QUALITY</span>
          </div>
          <div className="flex justify-around gap-2">
            {POWER_SYSTEM.optimization.slots.map(slot => (
              <div
                key={slot.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(slot.id, "optimization")}
                className="w-20 h-20 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isSlotFilled(slot.id) ? `${COLORS.green}20` : COLORS.glass,
                  border: `2px dashed ${isSlotFilled(slot.id) ? COLORS.green : COLORS.glassBorder}`,
                }}
              >
                {isSlotFilled(slot.id) ? (
                  <ComponentIcon componentId={slot.componentId} size={48} />
                ) : (
                  <span className="text-xl font-bold" style={{ color: `${COLORS.coolWhite}30` }}>?</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="powerFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.amber} />
              <stop offset="50%" stopColor={COLORS.orange} />
              <stop offset="100%" stopColor={COLORS.green} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${COLORS.deepAmber} 0%, #1a0a00 50%, #0a0500 100%)` }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="electricalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.amber} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#electricalGrid)" />
        </svg>
      </div>

      {/* Power flow particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ background: COLORS.amber }}
            initial={{ x: `${(i * 7) % 100}%`, y: "-5%", opacity: 0.6 }}
            animate={{ y: "105%", opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* HEADER */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-4 flex items-center justify-between"
        style={{ background: `${COLORS.glass}`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${COLORS.glassBorder}` }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke={COLORS.coolWhite} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.coolWhite }}>Power Quality Optimizer</h1>
            <p className="text-xs" style={{ color: `${COLORS.coolWhite}60` }}>
              {gameStep === 1 && "Install components"}
              {gameStep === 2 && "Ready to energize"}
              {gameStep === 3 && "Energizing system..."}
              {gameStep === 4 && `Event ${eventsCompleted + 1}/${totalEvents}`}
              {gameStep === 5 && "Complete!"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Power Factor Display */}
          <div className="text-center px-3 py-1 rounded-lg" style={{ background: powerFactor >= 0.95 ? `${COLORS.green}20` : `${COLORS.amber}20` }}>
            <div className="text-xs" style={{ color: `${COLORS.coolWhite}60` }}>PF</div>
            <div className="text-lg font-bold" style={{ color: powerFactor >= 0.95 ? COLORS.green : COLORS.amber }}>
              {powerFactor.toFixed(2)}
            </div>
          </div>
          
          {/* Timer */}
          <div 
            className="px-4 py-2 rounded-xl font-mono text-xl font-bold"
            style={{ 
              background: timeLeft <= 30 ? `${COLORS.red}20` : COLORS.glass,
              color: timeLeft <= 30 ? COLORS.red : COLORS.amber,
              border: `1px solid ${timeLeft <= 30 ? COLORS.red : COLORS.amber}30`,
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
            className="w-64 flex-shrink-0 m-4 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
          >
            <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
              <h2 className="text-base font-bold" style={{ color: COLORS.coolWhite }}>Components</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.coolWhite}60` }}>Drag to power system</p>
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
                      background: isPlaced ? `${COLORS.amber}10` : COLORS.glass,
                      border: `1px solid ${isPlaced ? COLORS.amber : COLORS.glassBorder}`,
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${COLORS.amber}15` }}
                    >
                      {isPlaced ? (
                        <svg className="w-5 h-5" fill="none" stroke={COLORS.amber} strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <ComponentIcon componentId={comp.id} size={36} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: COLORS.coolWhite }}>{comp.name}</p>
                      <p className="text-[10px] truncate" style={{ color: `${COLORS.coolWhite}50` }}>{comp.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CENTER - Power System Diagram */}
        <div className="flex-1 p-4 flex flex-col">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
          >
            {renderPowerSystemDiagram()}
          </motion.div>
        </div>

        {/* RIGHT PANEL - Status */}
        {!isMobile && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-72 flex-shrink-0 m-4 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}
          >
            <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
              <h2 className="text-base font-bold" style={{ color: COLORS.coolWhite }}>Power Quality</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.coolWhite}60` }}>Target: PF ≥ 0.95</p>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              {/* Power Factor Gauge */}
              <div className="text-center">
                <div 
                  className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
                  style={{ 
                    background: `conic-gradient(${powerFactor >= 0.95 ? COLORS.green : COLORS.amber} ${powerFactor * 100}%, ${COLORS.glass} 0%)`,
                    padding: '8px',
                  }}
                >
                  <div 
                    className="w-full h-full rounded-full flex flex-col items-center justify-center"
                    style={{ background: COLORS.deepAmber }}
                  >
                    <span className="text-3xl font-bold" style={{ color: powerFactor >= 0.95 ? COLORS.green : COLORS.amber }}>
                      {powerFactor.toFixed(2)}
                    </span>
                    <span className="text-xs" style={{ color: `${COLORS.coolWhite}60` }}>Power Factor</span>
                  </div>
                </div>
              </div>

              {/* THD */}
              <div className="p-3 rounded-xl" style={{ background: `${COLORS.glass}` }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: `${COLORS.coolWhite}70` }}>THD</span>
                  <span className="text-sm font-bold" style={{ color: thd <= 5 ? COLORS.green : COLORS.amber }}>{thd}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${COLORS.coolWhite}10` }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, thd * 5)}%`,
                      background: thd <= 5 ? COLORS.green : COLORS.amber,
                    }}
                  />
                </div>
              </div>

              {/* System Efficiency */}
              <div className="p-3 rounded-xl" style={{ background: `${COLORS.glass}` }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: `${COLORS.coolWhite}70` }}>System Ready</span>
                  <span className="text-sm font-bold" style={{ color: COLORS.amber }}>{Math.round(systemEfficiency)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${COLORS.coolWhite}10` }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${systemEfficiency}%`, background: COLORS.amber }}
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="text-center pt-2">
                <p className="text-xs" style={{ color: `${COLORS.coolWhite}50` }}>
                  Components: {placedComponents.length}/{CORRECT_SEQUENCE.length}
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
                    style={{ background: COLORS.glass, border: `2px solid ${isPlaced ? COLORS.amber : COLORS.glassBorder}`, minWidth: 90 }}
                  >
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.amber}20` }}>
                      {isPlaced ? (
                        <svg className="w-7 h-7" fill="none" stroke={COLORS.amber} strokeWidth="2.5" viewBox="0 0 24 24">
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${COLORS.amber}20` }}>
                {TUTORIAL_STEPS[tutorialStep].icon === "welcome" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "building" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" strokeLinecap="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "components" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" fill={`${COLORS.amber}30`} />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "events" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" />
                  </svg>
                )}
                {TUTORIAL_STEPS[tutorialStep].icon === "start" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              
              <div className="flex justify-center gap-1 mb-4">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === tutorialStep ? COLORS.amber : `${COLORS.coolWhite}30` }} />
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.coolWhite }}>{TUTORIAL_STEPS[tutorialStep].title}</h3>
              <p className="text-sm mb-6" style={{ color: `${COLORS.coolWhite}80` }}>{TUTORIAL_STEPS[tutorialStep].description}</p>
              
              <div className="flex gap-3 justify-center">
                <button onClick={handleSkipTutorial} className="px-4 py-2 rounded-xl" style={{ background: COLORS.glass, color: `${COLORS.coolWhite}80` }}>
                  Skip
                </button>
                <button onClick={handleNextTutorial} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.amber, color: COLORS.deepAmber }}>
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(20px)', border: `1px solid ${COLORS.amber}50` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.amber}20` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                  <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.amber }}>Hint</h3>
              <p className="text-sm mb-4" style={{ color: COLORS.coolWhite }}>{hintMessage}</p>
              <button onClick={() => setShowHint(false)} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.amber, color: COLORS.deepAmber }}>
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.amber}50` }}
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: `${COLORS.amber}20` }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.coolWhite }}>System Ready!</h2>
              <p className="text-sm mb-6" style={{ color: `${COLORS.coolWhite}70` }}>
                All components installed. Energize the system to test power quality performance.
              </p>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="p-3 rounded-lg" style={{ background: `${COLORS.amber}20` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.amber }}>{powerFactor.toFixed(2)}</div>
                  <div className="text-[10px]" style={{ color: `${COLORS.coolWhite}60` }}>Power Factor</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: `${COLORS.orange}20` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.orange }}>{thd}%</div>
                  <div className="text-[10px]" style={{ color: `${COLORS.coolWhite}60` }}>THD</div>
                </div>
              </div>
              
              <motion.button 
                onClick={handleStartSimulation}
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto"
                style={{ background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.orange})`, color: COLORS.deepAmber }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Energize System
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3: SYSTEMS ENERGIZING OVERLAY */}
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.amber}50` }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.coolWhite }}>Energizing System</h2>
              
              <div className="mb-6">
                <div className="h-3 rounded-full overflow-hidden" style={{ background: `${COLORS.coolWhite}10` }}>
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.orange})` }}
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
                      style={{ background: isActive ? `${COLORS.amber}15` : 'transparent' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: isActive ? COLORS.amber : COLORS.glass }}
                      >
                        {isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke={COLORS.deepAmber} strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: `${COLORS.coolWhite}30` }} />
                        )}
                      </div>
                      <span className="text-sm" style={{ color: isActive ? COLORS.coolWhite : `${COLORS.coolWhite}50` }}>
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.amber}50` }}
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
                  <h3 className="text-lg font-bold" style={{ color: COLORS.coolWhite }}>{currentEvent.title}</h3>
                  <p className="text-sm mt-1" style={{ color: `${COLORS.coolWhite}70` }}>{currentEvent.description}</p>
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
                    <span className="text-sm" style={{ color: COLORS.coolWhite }}>{option.text}</span>
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
                    style={{ background: i < eventsCompleted ? COLORS.green : i === eventsCompleted ? COLORS.amber : `${COLORS.coolWhite}30` }} 
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
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.amber}50` }}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.amber}30, ${COLORS.orange}30)`,
                  border: `3px solid ${COLORS.amber}`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <span className="text-4xl font-bold" style={{ color: COLORS.amber }}>{scoreBreakdown.grade}</span>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-1" style={{ color: COLORS.coolWhite }}>Power Quality Score</h2>
              <p className="text-4xl font-bold mb-4" style={{ color: COLORS.amber }}>{scoreBreakdown.total.toFixed(1)}/10</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: COLORS.glass }}>
                  <span className="text-sm" style={{ color: `${COLORS.coolWhite}70` }}>Installation</span>
                  <span className="font-bold" style={{ color: COLORS.amber }}>{scoreBreakdown.placement.toFixed(1)}/4</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: COLORS.glass }}>
                  <span className="text-sm" style={{ color: `${COLORS.coolWhite}70` }}>Time Bonus</span>
                  <span className="font-bold" style={{ color: COLORS.amber }}>{scoreBreakdown.time.toFixed(1)}/2</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: COLORS.glass }}>
                  <span className="text-sm" style={{ color: `${COLORS.coolWhite}70` }}>Event Response</span>
                  <span className="font-bold" style={{ color: COLORS.amber }}>{scoreBreakdown.events.toFixed(1)}/4</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-6 text-left">
                {scoreBreakdown.feedback.map((fb, i) => (
                  <p key={i} className="text-xs flex items-center gap-2" style={{ color: `${COLORS.coolWhite}70` }}>
                    <span style={{ color: COLORS.amber }}>•</span> {fb}
                  </p>
                ))}
              </div>
              
              <button 
                onClick={() => setShowThankYou(true)}
                className="w-full px-6 py-4 rounded-xl font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.orange})`, color: COLORS.deepAmber }}
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
