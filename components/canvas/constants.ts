/**
 * Engineering sequences and constants for the Plant Builder
 * Defines the valid component order for each sector
 */

import type { ComponentDefinition } from "./types";

/**
 * Engineering component sequences by sector
 * Each sector has 6 components that must be placed in order
 * - requiredBefore: Components that must be placed before this one
 * - connectsTo: Components this one connects to via pipes
 */
export const ENGINEERING_SEQUENCES: Record<string, ComponentDefinition[]> = {
  "Process": [
    { id: "tank", name: "Storage Tank", emoji: "🛢️", description: "Raw material storage", requiredBefore: [], connectsTo: ["pump"] },
    { id: "pump", name: "Feed Pump", emoji: "💧", description: "Transfers feed", requiredBefore: ["tank"], connectsTo: ["heat-exchanger"] },
    { id: "heat-exchanger", name: "Pre-Heater", emoji: "♨️", description: "Heats feed stream", requiredBefore: ["pump"], connectsTo: ["reactor"] },
    { id: "reactor", name: "Reactor", emoji: "🔬", description: "Main reaction vessel", requiredBefore: ["heat-exchanger"], connectsTo: ["separator"] },
    { id: "separator", name: "Separator", emoji: "🔀", description: "Separates products", requiredBefore: ["reactor"], connectsTo: ["filter"] },
    { id: "filter", name: "Filter", emoji: "🔳", description: "Final purification", requiredBefore: ["separator"], connectsTo: [] },
  ],
  "Electrical": [
    { id: "generator", name: "Generator", emoji: "🔋", description: "Power source", requiredBefore: [], connectsTo: ["transformer"] },
    { id: "transformer", name: "Transformer", emoji: "⚡", description: "Voltage step-down", requiredBefore: ["generator"], connectsTo: ["switchgear"] },
    { id: "switchgear", name: "Switchgear", emoji: "🔌", description: "Power distribution", requiredBefore: ["transformer"], connectsTo: ["panel"] },
    { id: "panel", name: "Control Panel", emoji: "🎛️", description: "Circuit control", requiredBefore: ["switchgear"], connectsTo: ["cable"] },
    { id: "cable", name: "Cable Tray", emoji: "〰️", description: "Power routing", requiredBefore: ["panel"], connectsTo: ["motor"] },
    { id: "motor", name: "Motor", emoji: "⚙️", description: "End equipment", requiredBefore: ["cable"], connectsTo: [] },
  ],
  "HVAC": [
    { id: "chiller", name: "Chiller", emoji: "❄️", description: "Cooling source", requiredBefore: [], connectsTo: ["cooling-tower"] },
    { id: "cooling-tower", name: "Cooling Tower", emoji: "🏗️", description: "Heat rejection", requiredBefore: ["chiller"], connectsTo: ["ahu"] },
    { id: "ahu", name: "Air Handler", emoji: "🌀", description: "Air conditioning", requiredBefore: ["cooling-tower"], connectsTo: ["duct"] },
    { id: "duct", name: "Ductwork", emoji: "🔲", description: "Air distribution", requiredBefore: ["ahu"], connectsTo: ["damper"] },
    { id: "damper", name: "Damper", emoji: "➖", description: "Flow control", requiredBefore: ["duct"], connectsTo: ["fan"] },
    { id: "fan", name: "Exhaust Fan", emoji: "💨", description: "Air circulation", requiredBefore: ["damper"], connectsTo: [] },
  ],
  "Oil & Gas": [
    { id: "wellhead", name: "Wellhead", emoji: "⛽", description: "Production source", requiredBefore: [], connectsTo: ["og-separator"] },
    { id: "og-separator", name: "Separator", emoji: "🔀", description: "Phase separation", requiredBefore: ["wellhead"], connectsTo: ["compressor"] },
    { id: "compressor", name: "Compressor", emoji: "💨", description: "Gas compression", requiredBefore: ["og-separator"], connectsTo: ["pipeline"] },
    { id: "pipeline", name: "Pipeline", emoji: "🔗", description: "Transport line", requiredBefore: ["compressor"], connectsTo: ["pig-launcher"] },
    { id: "pig-launcher", name: "Pig Launcher", emoji: "🚀", description: "Pipeline cleaning", requiredBefore: ["pipeline"], connectsTo: ["flare"] },
    { id: "flare", name: "Flare Stack", emoji: "🔥", description: "Emergency relief", requiredBefore: ["pig-launcher"], connectsTo: [] },
  ],
  "MEP": [
    { id: "fire-pump", name: "Fire Pump", emoji: "🧯", description: "Fire water source", requiredBefore: [], connectsTo: ["plumbing"] },
    { id: "plumbing", name: "Plumbing Riser", emoji: "🚿", description: "Water distribution", requiredBefore: ["fire-pump"], connectsTo: ["sprinkler"] },
    { id: "sprinkler", name: "Sprinkler", emoji: "💦", description: "Fire suppression", requiredBefore: ["plumbing"], connectsTo: ["bms"] },
    { id: "bms", name: "BMS Panel", emoji: "📊", description: "Building control", requiredBefore: ["sprinkler"], connectsTo: ["lighting"] },
    { id: "lighting", name: "Lighting", emoji: "💡", description: "Illumination", requiredBefore: ["bms"], connectsTo: ["elevator"] },
    { id: "elevator", name: "Elevator", emoji: "🛗", description: "Vertical transport", requiredBefore: ["lighting"], connectsTo: [] },
  ],
};

/** Color mapping for each sector */
export const SECTOR_COLORS: Record<string, string> = {
  "Process": "#8B5CF6",
  "Electrical": "#F59E0B",
  "HVAC": "#06B6D4",
  "Oil & Gas": "#EF4444",
  "MEP": "#10B981",
};

/** Timer duration in seconds (2 minutes 30 seconds) */
export const TIMER_DURATION = 150;

/** Component size in pixels */
export const COMPONENT_SIZE = 80;

/** Half component size for centering calculations */
export const COMPONENT_HALF = COMPONENT_SIZE / 2;
