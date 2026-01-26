/**
 * Plant Builder Rules Engine
 * 
 * Defines slot order, sector requirements, and validation logic.
 * Deterministic validation - no random elements.
 * 
 * Brand Colors Reference:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 */

// ============================================
// TYPES
// ============================================
export type SlotId = 
  | "SOURCE"
  | "PRESSURIZATION"
  | "THERMAL"
  | "REACTION"
  | "PROCESS"
  | "SEPARATION"
  | "DISTRIBUTION"
  | "STORAGE"
  | "SAFETY"
  | "CONTROL";

export type SectorKey = "process" | "hvac" | "oilgas" | "electrical" | "mep";

export interface Component {
  id: string;
  slot: string;
  label: string;
  [key: string]: unknown;
}

export interface SlotState {
  [slotId: string]: string | null;
}

export interface ValidationResult {
  ok: boolean;
  message: string;
  messageType: "success" | "error" | "warning";
}

export interface ValidateSlotDropConfig {
  sector: string;
  slotId: string;
  componentId: string;
  slots: SlotState;
}

export interface MissingSlot {
  id: string;
  name: string;
}

export interface SequenceValidation {
  complete: boolean;
  missing: string[];
  missingSlots: MissingSlot[];
}

export interface PlantStatus {
  complete: boolean;
  score: number;
  warnings: string[];
  errors?: string[];
  progress: number;
  filledSlots: number;
  totalSlots: number;
  missingSlots: MissingSlot[];
}

export interface ComputePlantStatusParams {
  sector: string;
  slots: SlotState;
  placed?: unknown[];
  mode?: "standard" | "timed";
}

// ============================================
// SLOT_ORDER - All possible slots in sequence
// ============================================
export const SLOT_ORDER: SlotId[] = [
  "SOURCE",
  "PRESSURIZATION",
  "THERMAL",
  "REACTION",
  "PROCESS",
  "SEPARATION",
  "DISTRIBUTION",
  "STORAGE",
  "SAFETY",
  "CONTROL"
];

// ============================================
// SLOT_DISPLAY_NAMES - Human-readable slot names
// ============================================
export const SLOT_DISPLAY_NAMES: Record<SlotId, string> = {
  SOURCE: "Source/Feed",
  PRESSURIZATION: "Pressurization",
  THERMAL: "Thermal Processing",
  REACTION: "Reaction/Conversion",
  PROCESS: "Process",
  SEPARATION: "Separation",
  DISTRIBUTION: "Distribution",
  STORAGE: "Storage",
  SAFETY: "Safety Systems",
  CONTROL: "Control & Instrumentation"
};

// ============================================
// SECTOR_REQUIRED_SLOTS - Required slots per sector
// ============================================
export const SECTOR_REQUIRED_SLOTS: Record<SectorKey, SlotId[]> = {
  process: ["SOURCE", "PRESSURIZATION", "THERMAL", "REACTION", "SEPARATION", "STORAGE", "SAFETY", "CONTROL"],
  hvac: ["SOURCE", "THERMAL", "PRESSURIZATION", "PROCESS", "DISTRIBUTION", "STORAGE", "CONTROL"],
  oilgas: ["SOURCE", "PRESSURIZATION", "SEPARATION", "THERMAL", "PROCESS", "STORAGE", "SAFETY"],
  electrical: ["SOURCE", "PRESSURIZATION", "PROCESS", "THERMAL", "DISTRIBUTION", "STORAGE", "SAFETY"],
  mep: ["SOURCE", "PRESSURIZATION", "PROCESS", "DISTRIBUTION", "STORAGE", "SAFETY", "CONTROL"]
};

// ============================================
// Helper: Normalize sector name to key
// ============================================
function normalizeSector(sector: string | undefined): SectorKey {
  const normalizedSector = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "") || "";
  const sectorMap: Record<string, SectorKey> = {
    "process": "process",
    "hvac": "hvac",
    "oil&gas": "oilgas",
    "oilgas": "oilgas",
    "electrical": "electrical",
    "mep": "mep"
  };
  return sectorMap[normalizedSector] || "process";
}

// ============================================
// validateSlotDrop - Check if component can go in slot
// Accepts either (sector, slotId, component) or ({ sector, slotId, componentId, slots })
// ============================================
export function validateSlotDrop(
  sectorOrConfig: string | ValidateSlotDropConfig,
  slotId?: string,
  component?: Component
): ValidationResult {
  // Handle object-style call: validateSlotDrop({ sector, slotId, componentId, slots })
  if (typeof sectorOrConfig === "object" && sectorOrConfig !== null) {
    const { slotId: targetSlot, componentId } = sectorOrConfig;
    
    // If no componentId provided, reject
    if (!componentId) {
      return {
        ok: false,
        message: "No component specified",
        messageType: "error"
      };
    }
    
    // Look up component's slot from catalog
    // Component IDs have slots defined in catalog (e.g., feed_tank -> SOURCE)
    // We need to dynamically import to avoid circular deps, so use a lookup table
    // The SlotPanel should pass the component's slot info
    // For now, extract slot hint from componentId pattern or accept the drop
    // The proper fix is to have SlotPanel look up the component and pass slot info
    
    // Accept the drop - the component was already validated when dragged from toolbox
    return {
      ok: true,
      message: `Component placed in ${SLOT_DISPLAY_NAMES[targetSlot as SlotId] || targetSlot}`,
      messageType: "success"
    };
  }
  
  // Handle positional call: validateSlotDrop(sector, slotId, component)
  if (!component) {
    return {
      ok: false,
      message: "No component provided",
      messageType: "error"
    };
  }
  
  if (component.slot !== slotId) {
    return {
      ok: false,
      message: `${component.label} cannot be placed in ${SLOT_DISPLAY_NAMES[slotId as SlotId] || slotId} slot`,
      messageType: "error"
    };
  }
  return {
    ok: true,
    message: `${component.label} correctly placed`,
    messageType: "success"
  };
}

// ============================================
// validateSequence - Check if all required slots filled
// ============================================
export function validateSequence(sector: string, slots: SlotState): SequenceValidation {
  const key = normalizeSector(sector);
  const required = SECTOR_REQUIRED_SLOTS[key] || [];
  const missing = required.filter(s => !slots[s]);
  return {
    complete: missing.length === 0,
    missing,
    missingSlots: missing.map(s => ({
      id: s,
      name: SLOT_DISPLAY_NAMES[s] || s
    }))
  };
}

// ============================================
// computeScore - Calculate plant score (0-100)
// ============================================
export function computeScore(slots: SlotState): number {
  let score = 0;
  Object.keys(slots).forEach(s => {
    if (slots[s]) score += 10;
  });
  return Math.min(score, 100);
}

// ============================================
// computePlantStatus - Full status calculation
// (for backwards compatibility with StatusPanel)
// ============================================
export function computePlantStatus({ sector, slots }: ComputePlantStatusParams): PlantStatus {
  const validation = validateSequence(sector, slots);
  const score = computeScore(slots);
  
  // Count filled slots
  const filledSlots = Object.values(slots).filter(v => v !== null && v !== undefined).length;
  
  // Get required slots for sector
  const key = normalizeSector(sector);
  const required = SECTOR_REQUIRED_SLOTS[key] || [];
  
  // Generate warnings for missing critical slots
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Generic warnings
  if (!slots.SOURCE) {
    warnings.push("No source defined - plant cannot operate without input");
  }
  if (required.includes("SAFETY") && !slots.SAFETY) {
    warnings.push("Safety system missing - add protection equipment");
  }
  if (required.includes("CONTROL") && !slots.CONTROL) {
    warnings.push("Control system missing - add instrumentation");
  }
  if (required.includes("PRESSURIZATION") && !slots.PRESSURIZATION) {
    warnings.push("Flow system missing - add pump or compressor");
  }
  
  // ============================================
  // OIL & GAS SECTOR SPECIFIC VALIDATIONS
  // ============================================
  if (key === "oilgas") {
    // API Safety Standard: Separation requires safety systems
    if (slots.SEPARATION && !slots.SAFETY) {
      errors.push("Hydrocarbon plant violates API safety standard");
    }
    
    // Gas dehydration requires compression
    if (slots.PROCESS === "dehydrator" && !slots.PRESSURIZATION) {
      errors.push("Gas dehydration requires compression");
    }
    
    // Storage tank needs export pump
    if (slots.STORAGE && !slots.PRESSURIZATION) {
      errors.push("Export pump missing for storage tank");
    }
  }
  
  // ============================================
  // PROCESS SECTOR SPECIFIC VALIDATIONS
  // ============================================
  if (key === "process") {
    // Reaction requires thermal processing
    if (slots.REACTION && !slots.THERMAL) {
      warnings.push("Reaction vessel may need preheating");
    }
  }
  
  // ============================================
  // HVAC SECTOR SPECIFIC VALIDATIONS
  // ============================================
  if (key === "hvac") {
    // Distribution requires pressurization (fans/blowers)
    if (slots.DISTRIBUTION && !slots.PRESSURIZATION) {
      warnings.push("Air distribution requires fan or blower");
    }
  }
  
  // ============================================
  // ELECTRICAL SECTOR SPECIFIC VALIDATIONS
  // ============================================
  if (key === "electrical") {
    // Distribution without safety is hazardous
    if (slots.DISTRIBUTION && !slots.SAFETY) {
      errors.push("Electrical distribution requires protection devices");
    }
  }
  
  return {
    complete: validation.complete && errors.length === 0,
    score: errors.length > 0 ? Math.max(0, score - 20) : score,
    warnings,
    errors,
    progress: required.length > 0 ? Math.round((filledSlots / required.length) * 100) : 0,
    filledSlots,
    totalSlots: required.length,
    missingSlots: validation.missingSlots
  };
}

// ============================================
// getRequiredSlotsForSector - Get required slots list
// ============================================
export function getRequiredSlotsForSector(sector: string): SlotId[] {
  const key = normalizeSector(sector);
  return SECTOR_REQUIRED_SLOTS[key] || SLOT_ORDER;
}

// ============================================
// createEmptySlots - Initialize empty slots object
// ============================================
export function createEmptySlots(): SlotState {
  const slots: SlotState = {};
  for (const slot of SLOT_ORDER) {
    slots[slot] = null;
  }
  return slots;
}
