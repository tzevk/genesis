"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThankYouOverlay from "./ThankYouOverlay";
import { saveScoreWithBackup } from "@/lib/utils";

// HVAC Smart Building Color Palette - Modern, clean, futuristic
const COLORS = {
  // Primary - Cool tones for HVAC
  cyan: "#00D4FF",
  teal: "#0EA5A5",
  darkBlue: "#0A1628",
  deepBlue: "#0F2847",
  glass: "rgba(255, 255, 255, 0.08)",
  glassLight: "rgba(255, 255, 255, 0.12)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
  // Accent colors
  neonGreen: "#00FF94",
  neonBlue: "#00B4FF",
  coolWhite: "#E8F4F8",
  warmOrange: "#FF6B35",
  // Temperature indicators
  coldBlue: "#00BFFF",
  hotRed: "#FF4757",
};

// HVAC Components - Building a smart cooling system
const COMPONENTS = [
  { id: "thermostat", name: "Smart Thermostat", order: 1 },
  { id: "ahu", name: "Air Handler Unit", order: 2 },
  { id: "chiller", name: "Chiller", order: 3 },
  { id: "ductwork", name: "Ductwork", order: 4 },
  { id: "vav", name: "VAV Box", order: 5 },
  { id: "diffuser", name: "Diffuser", order: 6 },
  { id: "sensor", name: "Room Sensor", order: 7 },
];

const CORRECT_SEQUENCE = ["thermostat", "ahu", "chiller", "ductwork", "vav", "diffuser", "sensor"];

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

// ============ HVAC COMPONENT ICONS (Modern SVG) ============

function ThermostatIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Outer ring - glassy */}
      <circle cx="40" cy="40" r="32" fill="url(#glassGradient)" stroke={COLORS.cyan} strokeWidth="2" />
      {/* Inner display */}
      <circle cx="40" cy="40" r="24" fill={COLORS.deepBlue} stroke={COLORS.glassBorder} strokeWidth="1" />
      {/* Temperature arc */}
      <path 
        d="M 22 50 A 22 22 0 0 1 58 50" 
        fill="none" 
        stroke={COLORS.neonGreen} 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Temperature display */}
      <text x="40" y="38" textAnchor="middle" fill={COLORS.coolWhite} fontSize="14" fontWeight="bold">72°</text>
      <text x="40" y="50" textAnchor="middle" fill={COLORS.cyan} fontSize="8">COOLING</text>
      {/* WiFi indicator */}
      <path d="M36 58 Q40 54 44 58" stroke={COLORS.neonGreen} strokeWidth="1.5" fill="none" />
      <path d="M34 61 Q40 55 46 61" stroke={COLORS.neonGreen} strokeWidth="1.5" fill="none" opacity="0.6" />
      <defs>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AHUIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Main unit - glassy panel */}
      <rect x="10" y="15" width="60" height="50" rx="8" fill={COLORS.deepBlue} stroke={COLORS.cyan} strokeWidth="2" />
      {/* Glass overlay */}
      <rect x="12" y="17" width="56" height="46" rx="6" fill="url(#ahuGlass)" />
      {/* Fan */}
      <circle cx="30" cy="40" r="14" fill={COLORS.darkBlue} stroke={COLORS.glassBorder} strokeWidth="1" />
      <g transform="translate(30, 40)">
        <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill={COLORS.cyan} opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M-10 0 L0 3 L10 0 L0 -3 Z" fill={COLORS.cyan} opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Control panel */}
      <rect x="48" y="25" width="18" height="30" rx="3" fill={COLORS.glass} stroke={COLORS.glassBorder} strokeWidth="1" />
      {/* LED indicators */}
      <circle cx="53" cy="32" r="2" fill={COLORS.neonGreen} />
      <circle cx="61" cy="32" r="2" fill={COLORS.cyan} />
      <rect x="51" y="38" width="12" height="4" rx="1" fill={COLORS.glass} />
      <rect x="51" y="45" width="12" height="4" rx="1" fill={COLORS.glass} />
      {/* Air flow arrows */}
      <path d="M5 40 L10 35 L10 45 Z" fill={COLORS.neonBlue} opacity="0.6" />
      <path d="M70 35 L75 40 L70 45 Z" fill={COLORS.neonBlue} opacity="0.6" />
      <defs>
        <linearGradient id="ahuGlass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ChillerIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Main chiller body */}
      <rect x="8" y="20" width="64" height="45" rx="6" fill={COLORS.deepBlue} stroke={COLORS.teal} strokeWidth="2" />
      {/* Glass panels */}
      <rect x="12" y="24" width="28" height="37" rx="4" fill={COLORS.glass} stroke={COLORS.glassBorder} strokeWidth="1" />
      <rect x="44" y="24" width="24" height="37" rx="4" fill={COLORS.glass} stroke={COLORS.glassBorder} strokeWidth="1" />
      {/* Cooling coils */}
      <path d="M16 32 Q20 28 24 32 T32 32" stroke={COLORS.coldBlue} strokeWidth="2" fill="none" />
      <path d="M16 40 Q20 36 24 40 T32 40" stroke={COLORS.coldBlue} strokeWidth="2" fill="none" />
      <path d="M16 48 Q20 44 24 48 T32 48" stroke={COLORS.coldBlue} strokeWidth="2" fill="none" />
      {/* Ice crystals / Cold indicator */}
      <text x="26" y="56" textAnchor="middle" fill={COLORS.cyan} fontSize="6">❄</text>
      {/* Temperature gauge */}
      <circle cx="56" cy="35" r="8" fill={COLORS.darkBlue} stroke={COLORS.glassBorder} strokeWidth="1" />
      <text x="56" y="38" textAnchor="middle" fill={COLORS.coldBlue} fontSize="8">4°</text>
      {/* Status LED */}
      <circle cx="56" cy="52" r="3" fill={COLORS.neonGreen}>
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Pipes */}
      <rect x="3" y="35" width="5" height="8" rx="2" fill={COLORS.teal} />
      <rect x="72" y="35" width="5" height="8" rx="2" fill={COLORS.teal} />
    </svg>
  );
}

function DuctworkIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Main duct */}
      <rect x="5" y="30" width="70" height="20" rx="4" fill={COLORS.deepBlue} stroke={COLORS.glassBorder} strokeWidth="2" />
      {/* Glass effect overlay */}
      <rect x="7" y="32" width="66" height="16" rx="3" fill="url(#ductGlass)" />
      {/* Airflow particles */}
      <circle cx="15" cy="40" r="2" fill={COLORS.neonBlue} opacity="0.8">
        <animate attributeName="cx" from="15" to="65" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="25" cy="38" r="1.5" fill={COLORS.cyan} opacity="0.6">
        <animate attributeName="cx" from="25" to="75" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="35" cy="42" r="1.5" fill={COLORS.neonBlue} opacity="0.7">
        <animate attributeName="cx" from="35" to="85" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Duct joints */}
      <rect x="25" y="28" width="4" height="24" rx="1" fill={COLORS.teal} opacity="0.5" />
      <rect x="50" y="28" width="4" height="24" rx="1" fill={COLORS.teal} opacity="0.5" />
      {/* Direction arrows */}
      <path d="M60 40 L68 35 L68 45 Z" fill={COLORS.cyan} opacity="0.4" />
      <defs>
        <linearGradient id="ductGlass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,212,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,212,255,0.02)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function VAVIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Box body */}
      <rect x="15" y="20" width="50" height="40" rx="6" fill={COLORS.deepBlue} stroke={COLORS.cyan} strokeWidth="2" />
      {/* Glass panel */}
      <rect x="18" y="23" width="44" height="34" rx="4" fill={COLORS.glass} />
      {/* Damper blades */}
      <g transform="translate(40, 40)">
        <rect x="-15" y="-2" width="30" height="4" rx="1" fill={COLORS.teal} transform="rotate(-15)">
          <animateTransform attributeName="transform" type="rotate" values="-15;15;-15" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="-15" y="-2" width="30" height="4" rx="1" fill={COLORS.teal} transform="rotate(15)" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values="15;-15;15" dur="3s" repeatCount="indefinite" />
        </rect>
      </g>
      {/* Digital display */}
      <rect x="52" y="26" width="10" height="8" rx="2" fill={COLORS.darkBlue} stroke={COLORS.glassBorder} strokeWidth="1" />
      <text x="57" y="33" textAnchor="middle" fill={COLORS.neonGreen} fontSize="6">75%</text>
      {/* Inlet/outlet */}
      <rect x="10" y="35" width="5" height="10" rx="2" fill={COLORS.glass} stroke={COLORS.glassBorder} strokeWidth="1" />
      <rect x="65" y="35" width="5" height="10" rx="2" fill={COLORS.glass} stroke={COLORS.glassBorder} strokeWidth="1" />
      {/* Status LED */}
      <circle cx="22" cy="28" r="2" fill={COLORS.neonGreen} />
    </svg>
  );
}

function DiffuserIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Ceiling mount */}
      <rect x="5" y="10" width="70" height="8" rx="2" fill={COLORS.glass} stroke={COLORS.glassBorder} strokeWidth="1" />
      {/* Diffuser body */}
      <path d="M15 18 L65 18 L55 35 L25 35 Z" fill={COLORS.deepBlue} stroke={COLORS.cyan} strokeWidth="1.5" />
      {/* Louvers */}
      <rect x="28" y="22" width="24" height="2" rx="1" fill={COLORS.teal} />
      <rect x="30" y="27" width="20" height="2" rx="1" fill={COLORS.teal} />
      <rect x="32" y="32" width="16" height="2" rx="1" fill={COLORS.teal} />
      {/* Air flow animation */}
      <g opacity="0.6">
        <path d="M35 38 Q40 48 45 38" stroke={COLORS.neonBlue} strokeWidth="1.5" fill="none">
          <animate attributeName="d" values="M35 38 Q40 48 45 38;M35 42 Q40 55 45 42;M35 38 Q40 48 45 38" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M30 40 Q35 52 40 40" stroke={COLORS.cyan} strokeWidth="1" fill="none">
          <animate attributeName="d" values="M30 40 Q35 52 40 40;M30 45 Q35 60 40 45;M30 40 Q35 52 40 40" dur="2.2s" repeatCount="indefinite" />
        </path>
        <path d="M40 40 Q45 52 50 40" stroke={COLORS.cyan} strokeWidth="1" fill="none">
          <animate attributeName="d" values="M40 40 Q45 52 50 40;M40 45 Q45 60 50 45;M40 40 Q45 52 50 40" dur="2.4s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Cool air particles */}
      <circle cx="40" cy="50" r="1.5" fill={COLORS.neonBlue}>
        <animate attributeName="cy" from="42" to="65" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="35" cy="48" r="1" fill={COLORS.cyan}>
        <animate attributeName="cy" from="45" to="68" dur="2.3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0" dur="2.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="48" r="1" fill={COLORS.cyan}>
        <animate attributeName="cy" from="45" to="68" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function SensorIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Sensor body - modern rounded square */}
      <rect x="20" y="20" width="40" height="40" rx="10" fill={COLORS.deepBlue} stroke={COLORS.cyan} strokeWidth="2" />
      {/* Glass overlay */}
      <rect x="23" y="23" width="34" height="34" rx="8" fill="url(#sensorGlass)" />
      {/* Temperature reading */}
      <text x="40" y="38" textAnchor="middle" fill={COLORS.coolWhite} fontSize="12" fontWeight="bold">68°</text>
      <text x="40" y="50" textAnchor="middle" fill={COLORS.neonGreen} fontSize="7">OPTIMAL</text>
      {/* Signal waves */}
      <path d="M55 25 Q62 20 62 30" stroke={COLORS.cyan} strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M58 22 Q68 15 68 35" stroke={COLORS.cyan} strokeWidth="1.5" fill="none" opacity="0.2" />
      {/* Motion indicator */}
      <circle cx="28" cy="28" r="3" fill={COLORS.neonGreen} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Mount */}
      <rect x="35" y="60" width="10" height="8" rx="2" fill={COLORS.glass} />
      <defs>
        <linearGradient id="sensorGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Component icon renderer
function ComponentIcon({ componentId, size = 80 }: { componentId: string; size?: number }) {
  switch (componentId) {
    case "thermostat": return <ThermostatIcon size={size} />;
    case "ahu": return <AHUIcon size={size} />;
    case "chiller": return <ChillerIcon size={size} />;
    case "ductwork": return <DuctworkIcon size={size} />;
    case "vav": return <VAVIcon size={size} />;
    case "diffuser": return <DiffuserIcon size={size} />;
    case "sensor": return <SensorIcon size={size} />;
    default: return null;
  }
}

// ============ TEMPERATURE GAUGE COMPONENT ============

function TemperatureGauge({ temperature, targetTemp = 68 }: { temperature: number; targetTemp?: number }) {
  const progress = Math.min(100, Math.max(0, ((85 - temperature) / (85 - 65)) * 100));
  const isNearTarget = Math.abs(temperature - targetTemp) <= 2;
  
  return (
    <div className="relative w-full p-4 rounded-2xl" style={{ 
      background: COLORS.glass,
      border: `1px solid ${COLORS.glassBorder}`,
      backdropFilter: 'blur(10px)',
    }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: COLORS.coolWhite }}>Room Temperature</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isNearTarget ? 'animate-pulse' : ''}`} style={{ 
          background: isNearTarget ? `${COLORS.neonGreen}30` : `${COLORS.warmOrange}30`,
          color: isNearTarget ? COLORS.neonGreen : COLORS.warmOrange,
        }}>
          {isNearTarget ? '✓ Optimal' : 'Cooling...'}
        </span>
      </div>
      
      {/* Temperature display */}
      <div className="flex items-end gap-1 mb-4">
        <span className="text-4xl font-bold" style={{ color: COLORS.coolWhite }}>{temperature}</span>
        <span className="text-lg mb-1" style={{ color: COLORS.cyan }}>°F</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: `${COLORS.hotRed}30` }}>
        <motion.div 
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{ 
            background: `linear-gradient(90deg, ${COLORS.coldBlue}, ${COLORS.neonGreen})`,
            boxShadow: `0 0 10px ${COLORS.neonGreen}50`,
          }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: `${COLORS.coolWhite}60` }}>
        <span>65°F</span>
        <span>Target: {targetTemp}°F</span>
        <span>85°F</span>
      </div>
    </div>
  );
}

// ============ MAIN CANVAS COMPONENT ============

interface HVAC2DCanvasProps {
  userName?: string;
  userPhone?: string;
  userSector?: string;
  isActive?: boolean;
  onComplete?: (score: number, timeLeft: number) => void;
  onExit?: () => void;
}

export function HVAC2DCanvas({ 
  userName = "Engineer",
  userPhone,
  userSector = "HVAC",
  isActive = true,
  onComplete,
  onExit,
}: HVAC2DCanvasProps) {
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
  const [temperature, setTemperature] = useState(82); // Starting temp - hot room
  const canvasRef = useRef<HTMLDivElement>(null);

  // Tutorial steps configuration
  const TUTORIAL_STEPS = [
    {
      id: "welcome",
      title: "HVAC Systems Builder",
      description: "Design and build a complete smart building HVAC system with climate control components.",
      icon: "welcome",
    },
    {
      id: "step1",
      title: "Step 1: Install Components",
      description: "Drag HVAC components into the correct slots. Follow the cooling chain: Control → Processing → Distribution → Feedback.",
      icon: "building",
    },
    {
      id: "step2",
      title: "Step 2: Watch Temperature Drop",
      description: "As you place components correctly, watch the room temperature drop from 82°F towards the target 68°F.",
      icon: "temperature",
    },
    {
      id: "step3",
      title: "Step 3: Complete the System",
      description: "Finish building the full HVAC chain to achieve optimal cooling performance.",
      icon: "components",
    },
    {
      id: "step4",
      title: "Step 4: Get Your Score",
      description: "Receive a detailed breakdown of your performance with expert feedback. Good luck!",
      icon: "start",
    },
  ];

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  // Pre-generate particle positions using lazy state initialization
  const [particlePositions] = useState(() => 
    [...Array(20)].map((_, i) => ({
      x: (i * 5.3 + 7) % 100,
      y: (i * 4.7 + 13) % 100,
      duration: 3 + (i % 5) * 0.4,
      delay: (i % 7) * 0.3,
    }))
  );

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

  // Temperature drop effect - cools down as components are placed
  useEffect(() => {
    if (placedComponents.length > 0 && temperature > 68) {
      const targetTemp = 82 - (placedComponents.length * 2); // Each component drops ~2°F
      const interval = setInterval(() => {
        setTemperature(prev => {
          if (prev <= targetTemp || prev <= 68) {
            clearInterval(interval);
            return Math.max(68, targetTemp);
          }
          return prev - 0.5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [placedComponents.length, temperature]);

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

  // Handle time's up
  useEffect(() => {
    if (isTimeUp && !scoreSaved) {
      const partialScore = Math.max(0, (placedComponents.length / CORRECT_SEQUENCE.length) * 5 - wrongAttempts * 0.5);
      
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
    const messages: Record<string, string> = {
      thermostat: "Start with the Smart Thermostat - it's the brain that controls the entire system.",
      ahu: "The Air Handler Unit processes air after receiving control signals from the thermostat.",
      chiller: "The Chiller provides cooling capacity to the Air Handler Unit.",
      ductwork: "Ductwork distributes the cooled air throughout the building.",
      vav: "VAV Boxes regulate airflow to different zones after the main ductwork.",
      diffuser: "Diffusers deliver the cooled air into the room space.",
      sensor: "Room Sensors provide feedback to the thermostat, completing the control loop.",
    };
    return messages[componentId] || `Place the correct component first.`;
  }, []);

  // Determine fault type
  const getFaultType = useCallback((attemptedComponent: string): string => {
    const attemptedIndex = CORRECT_SEQUENCE.indexOf(attemptedComponent);
    const expectedIndex = placedComponents.length;
    
    if (attemptedIndex > expectedIndex) return "order";
    if (attemptedIndex < expectedIndex && attemptedIndex !== -1) return "missing";
    if (attemptedComponent === "sensor" && expectedIndex < 6) return "feedback";
    if (attemptedComponent === "chiller" && expectedIndex !== 2) return "efficiency";
    return "order";
  }, [placedComponents]);

  // Handle drop on canvas
  const handleCanvasDrop = useCallback(() => {
    if (!draggingComponent) return;
    
    if (!isCorrectNext(draggingComponent)) {
      setWrongAttempts(prev => prev + 1);
      const faultType = getFaultType(draggingComponent);
      setLastFault(faultType);
      setFaultComponent(draggingComponent);
      
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
    
    setLastFault(null);
    setFaultComponent(null);
    
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
      
      if (updated.length === CORRECT_SEQUENCE.length) {
        setIsComplete(true);
        const timeBonus = timeLeft > 0 ? Math.min(3, Math.floor(timeLeft / 50)) : 0;
        const finalScore = Math.min(10, Math.max(0, 7 + timeBonus - wrongAttempts * 0.5));
        
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
  const activeTutorialSteps = TUTORIAL_STEPS;
  
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
    <div className="relative w-full h-screen overflow-hidden flex flex-col" style={{ 
      background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.deepBlue} 100%)`,
    }}>
      
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={COLORS.cyan} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Floating particles - static positions */}
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              background: COLORS.cyan,
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: pos.duration,
              repeat: Infinity,
              delay: pos.delay,
            }}
          />
        ))}
      </div>

      {/* MAIN HEADER */}
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="flex-shrink-0 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between relative z-20 gap-2"
        style={{ 
          background: COLORS.glass,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${COLORS.glassBorder}`,
          boxShadow: `0 4px 30px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Logo & Task Title */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div 
            className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.cyan}40, ${COLORS.teal}40)`,
              border: `1px solid ${COLORS.cyan}50`,
              boxShadow: `0 4px 20px ${COLORS.cyan}30`,
            }}
          >
            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke={COLORS.cyan} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-xl font-bold tracking-wide" style={{ color: COLORS.coolWhite }}>
              Smart HVAC Builder
            </h1>
            <p className="text-[10px] md:text-xs flex items-center gap-2" style={{ color: `${COLORS.coolWhite}70` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.neonGreen }}></span>
              Engineer: <strong style={{ color: COLORS.coolWhite }}>{userName}</strong>
            </p>
          </div>
        </div>

        {/* Task Badge - Hidden on mobile */}
        <div 
          className="hidden lg:flex px-4 py-2 rounded-xl items-center gap-3 flex-shrink-0"
          style={{ 
            background: COLORS.glass,
            border: `1px solid ${COLORS.glassBorder}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill={COLORS.cyan} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <div>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: `${COLORS.coolWhite}60` }}>Current Task</p>
            <p className="text-xs font-semibold leading-tight" style={{ color: COLORS.coolWhite }}>Build Smart Cooling System</p>
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
                    background: i < placedComponents.length ? COLORS.neonGreen : `${COLORS.coolWhite}30`,
                    transform: i === placedComponents.length ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: i < placedComponents.length ? `0 0 6px ${COLORS.neonGreen}` : 'none',
                  }}
                />
              ))}
            </div>
            <div 
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ 
                background: timeLeft <= 30 ? `${COLORS.warmOrange}20` : COLORS.glass,
                border: `1px solid ${timeLeft <= 30 ? COLORS.warmOrange : COLORS.glassBorder}`,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke={COLORS.cyan} strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              <span className="font-mono text-base font-bold" style={{ color: COLORS.coolWhite }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ 
              background: COLORS.glass,
              border: `1px solid ${COLORS.glassBorder}`,
            }}>
              <span className="text-base font-bold" style={{ color: COLORS.cyan }}>{Math.round(temperature)}°</span>
            </div>
          </div>
        )}

        {/* Help Button */}
        <button
          onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
          className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-all hover:scale-105 flex-shrink-0"
          style={{ 
            background: COLORS.glass,
            border: `1px solid ${COLORS.glassBorder}`,
          }}
        >
          <svg className="w-4 h-4" fill={COLORS.cyan} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
          <span className="text-xs md:text-sm font-medium hidden sm:inline" style={{ color: COLORS.cyan }}>Help</span>
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
            background: COLORS.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${COLORS.glassBorder}`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Toolbox Header */}
          <div 
            className="p-4 flex items-center gap-3"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.cyan}10, transparent)`,
              borderBottom: `1px solid ${COLORS.glassBorder}`,
            }}
          >
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.cyan}30, ${COLORS.teal}30)`,
                border: `1px solid ${COLORS.cyan}40`,
                boxShadow: `0 4px 15px ${COLORS.cyan}20`,
              }}
            >
              <svg className="w-6 h-6" fill={COLORS.cyan} viewBox="0 0 24 24">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: COLORS.coolWhite }}>Components</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.coolWhite}60` }}>Drag to build system</p>
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
                  ${isPlaced ? "cursor-default opacity-50" : "hover:translate-x-1"}
                  ${isDragging ? "scale-105 z-50" : ""}
                `}
                style={{ 
                  background: isPlaced 
                    ? `${COLORS.neonGreen}10`
                    : isDragging 
                      ? `${COLORS.cyan}20`
                      : COLORS.glass,
                  border: `1px solid ${
                    isPlaced ? `${COLORS.neonGreen}50` 
                    : isDragging ? COLORS.cyan 
                    : isNext && wrongAttempts >= 3 ? `${COLORS.neonGreen}80`
                    : COLORS.glassBorder
                  }`,
                  boxShadow: isDragging ? `0 8px 30px ${COLORS.cyan}30, 0 0 20px ${COLORS.cyan}20` : "none",
                }}
              >
                {/* Component Icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: isPlaced 
                      ? `${COLORS.neonGreen}20`
                      : `${COLORS.cyan}15`,
                    border: `1px solid ${isPlaced ? COLORS.neonGreen : COLORS.cyan}30`,
                  }}
                >
                  {isPlaced ? (
                    <svg className="w-5 h-5" fill="none" stroke={COLORS.neonGreen} strokeWidth="2.5" viewBox="0 0 24 24">
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
                    style={{ color: isPlaced ? COLORS.neonGreen : COLORS.coolWhite }}
                  >
                    {comp.name}
                  </p>
                  <p className="text-[10px]" style={{ color: `${COLORS.coolWhite}50` }}>
                    {isPlaced ? "✓ Connected" : "Drag to canvas"}
                  </p>
                </div>

                {/* Drag indicator */}
                {!isPlaced && (
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: COLORS.glass }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke={`${COLORS.coolWhite}50`} strokeWidth="2" viewBox="0 0 24 24">
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
            background: COLORS.glass,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${COLORS.glassBorder}`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.3), inset 0 0 60px ${COLORS.cyan}05`,
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
            {/* Smart building background */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={COLORS.darkBlue} />
                  <stop offset="100%" stopColor={COLORS.deepBlue} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#buildingGradient)" />
              
              {/* Room outline - glassy effect */}
              <rect x="10%" y="15%" width="80%" height="70%" rx="20" fill="none" stroke={COLORS.glassBorder} strokeWidth="2" strokeDasharray="10,5" />
              
              {/* Ceiling */}
              <rect x="12%" y="17%" width="76%" height="8%" fill={COLORS.glass} />
              
              {/* Airflow visualization when system is running */}
              {placedComponents.length >= 5 && (
                <g opacity="0.6">
                  {[...Array(8)].map((_, i) => (
                    <circle key={i} r="3" fill={COLORS.neonBlue} filter="url(#glow)">
                      <animate
                        attributeName="cx"
                        values={`${20 + i * 8}%;${20 + i * 8}%`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values="25%;75%;25%"
                        dur={`${2 + i * 0.2}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur={`${2 + i * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>
              )}
            </svg>

            {/* Drop zone indicator */}
            {placedComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="px-6 py-3 rounded-xl"
                  style={{ 
                    background: COLORS.glass,
                    border: `2px dashed ${COLORS.cyan}50`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: COLORS.cyan }}>
                    Drop components here to build
                  </p>
                </motion.div>
              </div>
            )}

            {/* System Status Legend */}
            <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} pointer-events-none z-20`}>
              <div 
                className={`${isMobile ? 'p-2' : 'p-3'} rounded-xl`}
                style={{ 
                  background: COLORS.glass,
                  border: `1px solid ${COLORS.glassBorder}`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <p className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold mb-1.5`} style={{ color: COLORS.cyan }}>
                  System Status
                </p>
                <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <span className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full`} style={{ 
                      background: placedComponents.length >= 1 ? COLORS.neonGreen : `${COLORS.coolWhite}30`,
                      boxShadow: placedComponents.length >= 1 ? `0 0 6px ${COLORS.neonGreen}` : 'none',
                    }}></span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: `${COLORS.coolWhite}80` }}>Control</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <span className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full`} style={{ 
                      background: placedComponents.length >= 3 ? COLORS.neonGreen : `${COLORS.coolWhite}30`,
                      boxShadow: placedComponents.length >= 3 ? `0 0 6px ${COLORS.neonGreen}` : 'none',
                    }}></span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: `${COLORS.coolWhite}80` }}>Cooling</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <span className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full`} style={{ 
                      background: placedComponents.length >= 5 ? COLORS.neonGreen : `${COLORS.coolWhite}30`,
                      boxShadow: placedComponents.length >= 5 ? `0 0 6px ${COLORS.neonGreen}` : 'none',
                    }}></span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: `${COLORS.coolWhite}80` }}>Distribution</span>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
                    <span className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full`} style={{ 
                      background: placedComponents.length >= 7 ? COLORS.neonGreen : `${COLORS.coolWhite}30`,
                      boxShadow: placedComponents.length >= 7 ? `0 0 6px ${COLORS.neonGreen}` : 'none',
                    }}></span>
                    <span className={`${isMobile ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: `${COLORS.coolWhite}80` }}>Feedback</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Fault Indicator */}
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
                      background: `${COLORS.warmOrange}20`,
                      border: `2px solid ${COLORS.warmOrange}`,
                      backdropFilter: 'blur(10px)',
                      boxShadow: `0 4px 20px ${COLORS.warmOrange}40`,
                    }}
                  >
                    <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill={COLORS.warmOrange} viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <div>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold`} style={{ color: COLORS.warmOrange }}>
                        {lastFault === 'order' && 'Wrong Order'}
                        {lastFault === 'missing' && 'Missing Component'}
                        {lastFault === 'feedback' && 'Feedback Loop Error'}
                        {lastFault === 'efficiency' && 'Efficiency Issue'}
                      </p>
                      {faultComponent && (
                        <p className={`${isMobile ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: `${COLORS.coolWhite}70` }}>
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
                  <div 
                    className="rounded-xl p-1"
                    style={{
                      background: COLORS.glass,
                      border: `1px solid ${COLORS.cyan}40`,
                      boxShadow: `0 4px 20px ${COLORS.cyan}20, 0 0 30px ${COLORS.cyan}10`,
                    }}
                  >
                    <ComponentIcon componentId={comp.componentId} size={compSize - 8} />
                  </div>
                </motion.div>
              );
            })}

            {/* Connection lines with neon airflow effect */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
              <defs>
                <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity="0.8" />
                  <stop offset="50%" stopColor={COLORS.cyan} stopOpacity="1" />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity="0.8" />
                </linearGradient>
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {placedComponents.slice(1).map((comp, index) => {
                const prevComp = placedComponents[index];
                const pipeOffset = isMobile ? 18 : 48;
                return (
                  <g key={comp.id}>
                    {/* Glowing pipe */}
                    <line
                      x1={prevComp.x + pipeOffset}
                      y1={prevComp.y}
                      x2={comp.x - pipeOffset}
                      y2={comp.y}
                      stroke="url(#pipeGradient)"
                      strokeWidth={isMobile ? 3 : 6}
                      strokeLinecap="round"
                      filter="url(#neonGlow)"
                    />
                    {/* Animated airflow particle */}
                    <circle r={isMobile ? 3 : 5} fill={COLORS.neonBlue} filter="url(#neonGlow)">
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
                      <animate
                        attributeName="opacity"
                        values="1;0.3;1"
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

        {/* RIGHT PANEL - Status & Temperature (Hidden on mobile) */}
        <motion.div 
          data-tutorial-id="right-panel"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="hidden md:flex w-80 flex-col flex-shrink-0 rounded-2xl overflow-hidden relative z-10"
          style={{ 
            background: COLORS.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${COLORS.glassBorder}`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Status Header */}
          <div 
            className="p-4 flex items-center gap-3"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.cyan}10, transparent)`,
              borderBottom: `1px solid ${COLORS.glassBorder}`,
            }}
          >
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.cyan}30, ${COLORS.teal}30)`,
                border: `1px solid ${COLORS.cyan}40`,
                boxShadow: `0 4px 15px ${COLORS.cyan}20`,
              }}
            >
              <svg className="w-6 h-6" fill={COLORS.cyan} viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: COLORS.coolWhite }}>System Monitor</h2>
              <p className="text-[11px]" style={{ color: `${COLORS.coolWhite}60` }}>Real-time status</p>
            </div>
          </div>

          {/* Temperature Gauge */}
          <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <TemperatureGauge temperature={Math.round(temperature)} targetTemp={68} />
          </div>

          {/* Timer & Score */}
          <div className="p-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <div className="flex gap-3">
              {/* Timer */}
              <motion.div
                animate={{ scale: timeLeft <= 30 ? [1, 1.02, 1] : 1 }}
                transition={{ repeat: timeLeft <= 30 ? Infinity : 0, duration: 0.5 }}
                className="flex-1 p-4 rounded-xl text-center"
                style={{ 
                  background: timeLeft <= 30 ? `${COLORS.warmOrange}15` : COLORS.glass,
                  border: `1px solid ${timeLeft <= 30 ? COLORS.warmOrange : COLORS.glassBorder}`,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke={COLORS.cyan} strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-xs uppercase font-bold tracking-wider" style={{ color: COLORS.cyan }}>Time</span>
                </div>
                <span className="font-mono text-3xl font-bold" style={{ color: COLORS.coolWhite }}>
                  {formatTime(timeLeft)}
                </span>
              </motion.div>

              {/* Score */}
              <div 
                className="flex-1 p-4 rounded-xl text-center"
                style={{ 
                  background: COLORS.glass,
                  border: `1px solid ${COLORS.glassBorder}`,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill={COLORS.neonGreen} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs uppercase font-bold tracking-wider" style={{ color: COLORS.neonGreen }}>Score</span>
                </div>
                <span className="text-3xl font-bold" style={{ color: COLORS.coolWhite }}>{score.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-4 py-4" style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: COLORS.coolWhite }}>Build Progress</span>
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ 
                background: `${COLORS.cyan}20`, 
                color: COLORS.cyan,
              }}>
                {placedComponents.length} / {CORRECT_SEQUENCE.length}
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: COLORS.glass }}>
              <motion.div 
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(placedComponents.length / CORRECT_SEQUENCE.length) * 100}%` }}
                transition={{ type: "spring", damping: 15 }}
                style={{ 
                  background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.neonGreen})`,
                  boxShadow: `0 0 15px ${COLORS.cyan}50`,
                }}
              />
            </div>
          </div>

          {/* System Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 flex items-center gap-2" style={{ 
              background: `${COLORS.cyan}05`, 
              borderBottom: `1px solid ${COLORS.glassBorder}`,
            }}>
              <svg className="w-5 h-5" fill={COLORS.cyan} viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.cyan }}>System Log</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {/* Initial message */}
              <div className="p-3 rounded-xl" style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}>
                <p className="text-xs" style={{ color: `${COLORS.coolWhite}90` }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: COLORS.cyan }}></span>
                  System ready. Build the cooling system.
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
                    style={{ background: `${COLORS.neonGreen}10`, border: `1px solid ${COLORS.neonGreen}30` }}
                  >
                    <p className="text-xs" style={{ color: `${COLORS.coolWhite}90` }}>
                      <span style={{ color: COLORS.neonGreen }}>✓</span> {compData?.name} connected #{index + 1}
                    </p>
                  </motion.div>
                );
              })}

              {/* Temperature update when components placed */}
              {placedComponents.length > 0 && temperature > 68 && (
                <motion.div 
                  key={`temp-${placedComponents.length}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl"
                  style={{ background: `${COLORS.coldBlue}10`, border: `1px solid ${COLORS.coldBlue}30` }}
                >
                  <p className="text-xs" style={{ color: `${COLORS.coolWhite}90` }}>
                    <span style={{ color: COLORS.coldBlue }}>❄</span> Cooling active... {Math.round(temperature)}°F
                  </p>
                </motion.div>
              )}

              {/* Completion message */}
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl"
                  style={{ background: `${COLORS.neonGreen}20`, border: `1px solid ${COLORS.neonGreen}50` }}
                >
                  <p className="text-xs font-medium" style={{ color: COLORS.neonGreen }}>
                    ✓ System complete! Room at optimal temperature.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Exit hint */}
          <div 
            className="px-4 py-3 flex items-center justify-center gap-2"
            style={{ background: COLORS.glass, borderTop: `1px solid ${COLORS.glassBorder}` }}
          >
            <kbd className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: COLORS.glass, color: `${COLORS.coolWhite}70`, border: `1px solid ${COLORS.glassBorder}` }}>ESC</kbd>
            <span className="text-[11px]" style={{ color: `${COLORS.coolWhite}50` }}>to exit</span>
          </div>
        </motion.div>

        {/* MOBILE BOTTOM TOOLBAR */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 20 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{ 
            background: COLORS.glass,
            backdropFilter: 'blur(20px)',
            borderTop: `1px solid ${COLORS.cyan}40`,
            boxShadow: `0 -10px 50px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="px-2 py-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold flex-shrink-0" style={{ color: COLORS.cyan }}>
                ❄
              </p>
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {shuffledComponents.map((comp) => {
                  const isPlaced = placedComponents.some((p) => p.componentId === comp.id);
                  return (
                    <motion.div
                      key={comp.id}
                      draggable={!isPlaced && !isComplete}
                      onDragStart={() => handleDragStart(comp.id)}
                      whileTap={{ scale: isPlaced ? 1 : 0.9 }}
                      className={`relative flex-shrink-0 flex flex-col items-center p-1 rounded-lg transition-all ${
                        isPlaced ? 'opacity-40' : 'cursor-grab active:cursor-grabbing'
                      }`}
                      style={{ 
                        background: isPlaced ? `${COLORS.neonGreen}10` : COLORS.glass,
                        border: `1px solid ${isPlaced ? `${COLORS.neonGreen}30` : COLORS.glassBorder}`,
                      }}
                    >
                      <div 
                        className="w-9 h-9 rounded-md flex items-center justify-center"
                        style={{ background: isPlaced ? `${COLORS.neonGreen}15` : `${COLORS.cyan}15` }}
                      >
                        {isPlaced ? (
                          <svg className="w-4 h-4" fill={COLORS.neonGreen} viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        ) : (
                          <ComponentIcon componentId={comp.id} size={22} />
                        )}
                      </div>
                      <span 
                        className="text-[7px] font-medium text-center leading-tight mt-0.5 w-10 truncate"
                        style={{ color: isPlaced ? `${COLORS.coolWhite}40` : COLORS.coolWhite }}
                      >
                        {comp.name.split(' ')[0]}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded" style={{ 
                color: COLORS.cyan, 
                background: `${COLORS.cyan}20`,
                border: `1px solid ${COLORS.cyan}30`,
              }}>
                {placedComponents.length}/{CORRECT_SEQUENCE.length}
              </p>
            </div>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" style={{ background: COLORS.darkBlue }} />
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
            <div className="absolute inset-0 bg-black/90" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative z-10 max-w-md w-full p-8 rounded-3xl text-center"
              style={{ background: COLORS.glass, backdropFilter: 'blur(30px)', border: `1px solid ${COLORS.glassBorder}` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${COLORS.cyan}20` }}>
                {currentTutorialStep.icon === "welcome" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {currentTutorialStep.icon === "building" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
                    <path d="M2 20h20M4 20V8l8-5 8 5v12M8 20v-4h8v4M8 11h.01M16 11h.01M12 11h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {currentTutorialStep.icon === "temperature" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
                    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11v3" strokeLinecap="round" />
                  </svg>
                )}
                {currentTutorialStep.icon === "components" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" fill={`${COLORS.cyan}30`} />
                  </svg>
                )}
                {currentTutorialStep.icon === "start" && (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              
              <div className="flex justify-center gap-1 mb-4">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === tutorialStep ? COLORS.cyan : `${COLORS.coolWhite}30` }} />
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.coolWhite }}>{currentTutorialStep.title}</h3>
              <p className="text-sm mb-6" style={{ color: `${COLORS.coolWhite}80` }}>{currentTutorialStep.description}</p>
              
              <div className="flex gap-3 justify-center">
                <button onClick={handleSkipTutorial} className="px-4 py-2 rounded-xl" style={{ background: COLORS.glass, color: `${COLORS.coolWhite}80` }}>
                  Skip
                </button>
                <button onClick={handleNextTutorial} className="px-6 py-2 rounded-xl font-bold" style={{ background: COLORS.cyan, color: COLORS.darkBlue }}>
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? "Start!" : "Next"}
                </button>
              </div>
            </motion.div>
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
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: 'blur(10px)' }}
            onClick={() => setShowHint(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="p-6 rounded-2xl max-w-md text-center"
              style={{ 
                background: COLORS.glass,
                backdropFilter: 'blur(30px)',
                border: `1px solid ${COLORS.cyan}50`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${COLORS.cyan}20`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ 
                background: `${COLORS.cyan}20`,
                border: `1px solid ${COLORS.cyan}40`,
              }}>
                <svg className="w-8 h-8" fill={COLORS.cyan} viewBox="0 0 24 24">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.cyan }}>
                Hint
              </h3>
              <p className="text-base mb-4" style={{ color: COLORS.coolWhite }}>
                {hintMessage}
              </p>
              <button
                onClick={() => setShowHint(false)}
                className="px-6 py-2 rounded-xl font-bold transition-transform hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.teal})`,
                  color: COLORS.darkBlue,
                }}
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
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: 'blur(15px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="p-8 rounded-3xl text-center max-w-md"
              style={{ 
                background: COLORS.glass,
                backdropFilter: 'blur(30px)',
                border: `1px solid ${COLORS.neonGreen}50`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${COLORS.neonGreen}20`,
              }}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: `${COLORS.neonGreen}20`,
                  border: `1px solid ${COLORS.neonGreen}40`,
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <svg className="w-14 h-14" fill="none" stroke={COLORS.neonGreen} strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.neonGreen }}>
                System Complete!
              </h2>
              <p className="text-lg mb-2" style={{ color: COLORS.coolWhite }}>
                Smart cooling system is operational!
              </p>
              <p className="text-base mb-6" style={{ color: COLORS.coldBlue }}>
                Room cooled to optimal {Math.round(temperature)}°F
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-xl" style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.neonGreen }}>
                    {score.toFixed(1)}/10
                  </div>
                  <div className="text-sm" style={{ color: COLORS.coolWhite }}>Final Score</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.cyan }}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.coolWhite }}>Time Left</div>
                </div>
              </div>
              <button
                onClick={() => setShowThankYou(true)}
                className="w-full px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.neonGreen})`,
                  color: COLORS.darkBlue,
                  boxShadow: `0 4px 20px ${COLORS.cyan}40`,
                }}
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
            style={{ background: "rgba(0,0,0,0.9)", backdropFilter: 'blur(15px)' }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="p-10 rounded-3xl text-center max-w-md"
              style={{ 
                background: COLORS.glass,
                backdropFilter: 'blur(30px)',
                border: `1px solid ${COLORS.warmOrange}50`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 60px ${COLORS.warmOrange}20`,
              }}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: `${COLORS.warmOrange}20`,
                  border: `1px solid ${COLORS.warmOrange}40`,
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <svg className="w-14 h-14" fill="none" stroke={COLORS.warmOrange} strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
              </motion.div>
              <motion.h2 
                className="text-4xl font-bold mb-3"
                style={{ color: COLORS.warmOrange }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                Time&apos;s Up!
              </motion.h2>
              <p className="text-lg mb-6" style={{ color: COLORS.coolWhite }}>
                You placed {placedComponents.length} of {CORRECT_SEQUENCE.length} components
              </p>
              <div className="p-4 rounded-xl mb-6" style={{ background: COLORS.glass, border: `1px solid ${COLORS.glassBorder}` }}>
                <div className="text-3xl font-bold" style={{ color: COLORS.cyan }}>
                  {score.toFixed(1)}/10
                </div>
                <div className="text-sm" style={{ color: COLORS.coolWhite }}>Your Score</div>
              </div>
              <p className="text-sm" style={{ color: `${COLORS.coolWhite}60` }}>
                Redirecting to dashboard...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
