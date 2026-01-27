/**
 * Component Catalog for Plant Builder
 * 
 * Defines all draggable engineering components with metadata.
 * Each component has: id, label, slot
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 * - #FFFFFF (white)
 */

// ============================================
// SVG ICON COMPONENTS
// Minimal, professional line icons
// ============================================

export const ICONS = {
  // Core Equipment Icons
  tank: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="4" y1="8" x2="20" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  
  pump: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M12 6V2M12 22v-4M6 12H2M22 12h-4"/><circle cx="12" cy="12" r="2"/></svg>`,
  
  heatExchanger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7 6v12M12 6v12M17 6v12"/><path d="M3 10h18M3 14h18"/></svg>`,
  
  reactor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v4H8zM6 7h12v14H6z"/><circle cx="12" cy="14" r="3"/><path d="M12 7v4"/></svg>`,
  
  separator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>`,
  
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18l-7 8v8l-4-2v-6L3 4z"/></svg>`,
  
  compressor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="10" rx="1"/><path d="M8 8V5a2 2 0 012-2h4a2 2 0 012 2v3"/><path d="M8 12h8M8 15h8"/></svg>`,
  
  fan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3c-2 3-2 6 0 9M12 12c2 3 2 6 0 9"/><path d="M3 12c3-2 6-2 9 0M12 12c3 2 6 2 9 0"/></svg>`,
  
  column: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="1"/><line x1="7" y1="6" x2="17" y2="6"/><line x1="7" y1="10" x2="17" y2="10"/><line x1="7" y1="14" x2="17" y2="14"/><line x1="7" y1="18" x2="17" y2="18"/></svg>`,
  
  vessel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6c0-1.1.9-2 2-2h8a2 2 0 012 2v12a4 4 0 01-4 4h-4a4 4 0 01-4-4V6z"/><line x1="6" y1="10" x2="18" y2="10"/></svg>`,
  
  // Utility Icons
  pipe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/></svg>`,
  
  valve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h4l4-4 4 4h4"/><line x1="12" y1="8" x2="12" y2="4"/><rect x="9" y="2" width="6" height="3" rx="1"/></svg>`,
  
  heater: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10c1-2 2-2 4 0s3 2 4 0"/><path d="M8 14c1-2 2-2 4 0s3 2 4 0"/></svg>`,
  
  cooler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
  
  mixer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><line x1="12" y1="4" x2="12" y2="8"/><path d="M9 11l3 3 3-3"/></svg>`,
  
  // Safety Icons
  reliefValve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6"/><path d="M8 9h8l-4 6-4-6z"/><rect x="8" y="15" width="8" height="6" rx="1"/></svg>`,
  
  flare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V10"/><path d="M8 22h8"/><path d="M10 10c-1-4 0-7 2-8 2 1 3 4 2 8"/><path d="M8 6c0-2 2-4 4-4s4 2 4 4"/></svg>`,
  
  breaker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M12 14v4"/><line x1="9" y1="18" x2="15" y2="18"/></svg>`,
  
  damper: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M7 9l4 3-4 3"/></svg>`,
  
  esdValve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/><path d="M8 8l8 8"/></svg>`,
  
  sprinkler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"/><path d="M12 9v3"/><path d="M6 16c2-2 4-4 6-4s4 2 6 4"/><path d="M4 20c3-2 5-4 8-4s5 2 8 4"/></svg>`,
  
  // Control Icons
  controller: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><circle cx="15" cy="9" r="1.5"/><path d="M8 14h8"/><line x1="12" y1="14" x2="12" y2="17"/></svg>`,
  
  sensor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="8" stroke-dasharray="4 2"/></svg>`,
  
  plc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="1"/><line x1="7" y1="10" x2="7" y2="14"/><line x1="11" y1="10" x2="11" y2="14"/><line x1="15" y1="10" x2="15" y2="14"/><circle cx="18" cy="12" r="1"/></svg>`,
  
  vfd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 14l2-4 2 2 2-4 2 4"/></svg>`,
  
  thermostat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="16" r="4"/><path d="M10 4h4v8h-4z"/><circle cx="12" cy="16" r="1.5"/></svg>`,
  
  flowMeter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 6v6l4 2"/><path d="M3 12h3M18 12h3"/></svg>`,
  
  // Generic/Utility
  generator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="10" rx="1"/><path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"/><circle cx="8" cy="13" r="2"/><path d="M14 11h4v4h-4z"/></svg>`,
  
  battery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M20 10h2v4h-2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/></svg>`,
  
  transformer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/><path d="M4 12H2M22 12h-2"/></svg>`,
  
  chiller: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M12 10v4M10 12h4"/><path d="M7 6v-2M17 6v-2M7 18v2M17 18v2"/></svg>`,
  
  boiler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M8 8V6a4 4 0 018 0v2"/><path d="M9 14h6"/><circle cx="12" cy="14" r="1"/></svg>`,
  
  wellhead: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V9"/><path d="M8 9h8"/><path d="M6 5h12v4H6z"/><path d="M10 5V3h4v2"/></svg>`,
  
  // Oil & Gas specific icons
  oilReservoir: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="18" rx="8" ry="3"/><path d="M4 18v-4c0-1.5 3.5-3 8-3s8 1.5 8 3v4"/><path d="M8 11c0-2 1.8-4 4-4s4 2 4 4"/><circle cx="12" cy="7" r="1"/></svg>`,
  
  drillingRig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v16"/><path d="M8 6l4-4 4 4"/><path d="M6 10h12"/><path d="M8 10v8H6v2h12v-2h-2v-8"/><path d="M10 18h4"/><path d="M12 18v4"/></svg>`,
  
  floatingPlatform: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="6" rx="1"/><path d="M6 10V7h4v3"/><path d="M14 10V5h4v5"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M8 16v2"/><path d="M16 16v2"/></svg>`,
  
  pipeline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h6"/><path d="M16 12h6"/><rect x="8" y="9" width="8" height="6" rx="1"/><circle cx="12" cy="12" r="1"/><path d="M5 9v6"/><path d="M19 9v6"/></svg>`,
  
  oilWaterSeparator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12h16" stroke-dasharray="4 2"/><path d="M8 9v3"/><path d="M16 15v3"/></svg>`,
  
  storageTank: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="7" ry="2"/><path d="M5 5v14c0 1.1 3.13 2 7 2s7-.9 7-2V5"/><path d="M5 12c0 1.1 3.13 2 7 2s7-.9 7-2"/><path d="M12 7v4"/></svg>`,
  
  tanker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16h20v3H2z"/><path d="M4 13h12v3H4z"/><path d="M16 11l4 5"/><ellipse cx="6" cy="11" rx="2" ry="2"/><ellipse cx="12" cy="11" rx="2" ry="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="21" r="2"/></svg>`
};

// ============================================
// COMPONENT CATALOG BY SECTOR
// Sector-specific component lists
// ============================================
export const COMPONENT_CATALOG_BY_SECTOR = {
  process: [
    { id: "feed_tank", label: "Feed Tank", slot: "SOURCE" },
    { id: "pump", label: "Pump", slot: "PRESSURIZATION" },
    { id: "preheater", label: "Preheater", slot: "THERMAL" },
    { id: "heat_exchanger", label: "Heat Exchanger", slot: "THERMAL" },
    { id: "reactor", label: "Reactor", slot: "REACTION" },
    { id: "distillation_column", label: "Distillation Column", slot: "SEPARATION" },
    { id: "condenser", label: "Condenser", slot: "SEPARATION" },
    { id: "reboiler", label: "Reboiler", slot: "SEPARATION" },
    { id: "separator", label: "Separator", slot: "SEPARATION" },
    { id: "product_tank", label: "Product Tank", slot: "STORAGE" },
    { id: "relief_valve", label: "Relief Valve", slot: "SAFETY" },
    { id: "control_valve", label: "Control Valve", slot: "CONTROL" }
  ],

  hvac: [
    { id: "cooling_tower", label: "Cooling Tower", slot: "SOURCE" },
    { id: "chiller", label: "Chiller", slot: "THERMAL" },
    { id: "primary_pump", label: "Primary Pump", slot: "PRESSURIZATION" },
    { id: "secondary_pump", label: "Secondary Pump", slot: "PRESSURIZATION" },
    { id: "thermal_storage", label: "Thermal Storage Tank", slot: "THERMAL" },
    { id: "ahu", label: "AHU", slot: "REACTION" },
    { id: "vav_box", label: "VAV Box", slot: "SEPARATION" },
    { id: "duct_network", label: "Duct Network", slot: "SEPARATION" },
    { id: "bms_controller", label: "BMS Controller", slot: "CONTROL" },
    { id: "room_zone", label: "Room Zone", slot: "STORAGE" }
  ],

  oilgas: [
    // Upstream Stage
    { id: "oil_reservoir", label: "Oil Reservoir", slot: "SOURCE", stage: "upstream" },
    { id: "drilling_rig", label: "Drilling Rig", slot: "PRESSURIZATION", stage: "upstream" },
    { id: "floating_platform", label: "Floating Offshore Platform", slot: "REACTION", stage: "upstream" },
    // Midstream Stage
    { id: "pipeline_onshore", label: "Pipeline to Onshore", slot: "SEPARATION", stage: "midstream" },
    // Downstream Stage
    { id: "oil_water_separator", label: "Oil and Water Separator", slot: "THERMAL", stage: "downstream" },
    { id: "storage_tank", label: "Storage Tank", slot: "STORAGE", stage: "downstream" },
    { id: "tanker", label: "Tanker", slot: "CONTROL", stage: "downstream" }
  ],

  electrical: [
    { id: "generator", label: "Generator", slot: "SOURCE" },
    { id: "stepup_transformer", label: "Step-Up Transformer", slot: "PRESSURIZATION" },
    { id: "switchyard", label: "Switchyard", slot: "REACTION" },
    { id: "relay", label: "Protection Relay", slot: "SAFETY" },
    { id: "stepdown_transformer", label: "Step-Down Transformer", slot: "THERMAL" },
    { id: "distribution_panel", label: "Distribution Panel", slot: "SEPARATION" },
    { id: "critical_load", label: "Critical Load", slot: "STORAGE" },
    { id: "noncritical_load", label: "Non-Critical Load", slot: "STORAGE" }
  ],

  mep: [
    { id: "water_tank", label: "Water Tank", slot: "SOURCE" },
    { id: "booster_pump", label: "Booster Pump", slot: "PRESSURIZATION" },
    { id: "plumbing_network", label: "Plumbing Network", slot: "REACTION" },
    { id: "fire_pump", label: "Fire Pump", slot: "SAFETY" },
    { id: "sprinkler_network", label: "Sprinkler Network", slot: "SEPARATION" },
    { id: "mep_generator", label: "Generator", slot: "SOURCE" },
    { id: "panel", label: "Electrical Panel", slot: "SEPARATION" },
    { id: "ups", label: "UPS", slot: "CONTROL" },
    { id: "building_zone", label: "Building Zone", slot: "STORAGE" }
  ]
};

// ============================================
// ICON MAPPING FOR COMPONENTS
// Maps component IDs to icon keys
// ============================================
const COMPONENT_ICON_MAP = {
  // Process
  feed_tank: "tank",
  pump: "pump",
  preheater: "heater",
  heat_exchanger: "heatExchanger",
  reactor: "reactor",
  distillation_column: "column",
  condenser: "cooler",
  reboiler: "heater",
  separator: "separator",
  product_tank: "vessel",
  relief_valve: "reliefValve",
  control_valve: "valve",
  // HVAC
  cooling_tower: "cooler",
  chiller: "chiller",
  primary_pump: "pump",
  secondary_pump: "pump",
  thermal_storage: "tank",
  ahu: "fan",
  vav_box: "damper",
  duct_network: "pipe",
  bms_controller: "controller",
  room_zone: "thermostat",
  // Oil & Gas
  oil_reservoir: "oilReservoir",
  drilling_rig: "drillingRig",
  floating_platform: "floatingPlatform",
  pipeline_onshore: "pipeline",
  oil_water_separator: "oilWaterSeparator",
  storage_tank: "storageTank",
  tanker: "tanker",
  // Electrical
  generator: "generator",
  stepup_transformer: "transformer",
  switchyard: "breaker",
  relay: "esdValve",
  stepdown_transformer: "transformer",
  distribution_panel: "plc",
  critical_load: "battery",
  noncritical_load: "sensor",
  // MEP
  water_tank: "tank",
  booster_pump: "pump",
  plumbing_network: "pipe",
  fire_pump: "pump",
  sprinkler_network: "sprinkler",
  mep_generator: "generator",
  panel: "plc",
  ups: "battery",
  building_zone: "thermostat"
};

// ============================================
// CATEGORY DEFINITIONS
// Order and metadata for categories
// ============================================
export const CATEGORIES = [
  { id: "Core", label: "Core Equipment", order: 1 },
  { id: "Utility", label: "Utility", order: 2 },
  { id: "Safety", label: "Safety", order: 3 },
  { id: "Control", label: "Control", order: 4 }
];

// ============================================
// HELPER: Map slot to category
// ============================================
function getCategory(slot) {
  switch (slot) {
    case "SOURCE":
    case "STORAGE":
      return "Core";
    case "PRESSURIZATION":
    case "THERMAL":
    case "REACTION":
    case "SEPARATION":
      return "Utility";
    case "SAFETY":
      return "Safety";
    case "CONTROL":
      return "Control";
    default:
      return "Utility";
  }
}

// ============================================
// FLAT COMPONENT CATALOG (for backwards compatibility)
// All components with full metadata
// ============================================
export const COMPONENT_CATALOG = Object.entries(COMPONENT_CATALOG_BY_SECTOR).flatMap(
  ([sector, components]) =>
    components.map((comp) => ({
      id: comp.id,
      label: comp.label,
      slotHint: comp.slot,
      category: getCategory(comp.slot),
      icon: COMPONENT_ICON_MAP[comp.id] || "tank",
      sectorTags: [sector]
    }))
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get components for a specific sector (raw format)
 * @param {string} sector - The active sector
 * @returns {Array} Array of components for that sector
 */
export function getComponentsForSector(sector) {
  return COMPONENT_CATALOG_BY_SECTOR[sector] || [];
}

/**
 * Get components filtered by sector, grouped by category
 * @param {string} sector - The active sector (case-insensitive, handles display names)
 * @returns {Object} Components grouped by category
 */
export function getComponentsBySector(sector) {
  // Normalize sector name: lowercase and remove special chars
  const normalizedSector = sector
    ?.toLowerCase()
    .replace(/\s+/g, "")
    .replace(/&/g, "");
  
  // Map display names to catalog keys
  const sectorMap = {
    "process": "process",
    "hvac": "hvac",
    "oil&gas": "oilgas",
    "oilgas": "oilgas",
    "electrical": "electrical",
    "mep": "mep"
  };
  
  const catalogKey = sectorMap[normalizedSector] || normalizedSector;
  const sectorComponents = COMPONENT_CATALOG_BY_SECTOR[catalogKey] || [];
  
  const grouped = {};
  for (const cat of CATEGORIES) {
    grouped[cat.id] = sectorComponents
      .filter((comp) => getCategory(comp.slot) === cat.id)
      .map((comp) => ({
        id: comp.id,
        label: comp.label,
        slotHint: comp.slot,
        category: cat.id,
        icon: COMPONENT_ICON_MAP[comp.id] || "tank",
        sectorTags: [catalogKey]
      }));
  }
  
  return grouped;
}

/**
 * Get a single component by ID (searches all sectors)
 * @param {string} id - Component ID
 * @returns {Object|undefined} Component object with full metadata
 */
export function getComponentById(id) {
  for (const [sector, components] of Object.entries(COMPONENT_CATALOG_BY_SECTOR)) {
    const comp = components.find((c) => c.id === id);
    if (comp) {
      return {
        id: comp.id,
        label: comp.label,
        slot: comp.slot,
        slotHint: comp.slot,
        category: getCategory(comp.slot),
        icon: COMPONENT_ICON_MAP[comp.id] || "tank",
        sectorTags: [sector]
      };
    }
  }
  return undefined;
}

/**
 * Get the SVG icon string for a component
 * @param {string} iconKey - Icon key from component
 * @returns {string} SVG string
 */
export function getIconSvg(iconKey) {
  return ICONS[iconKey] || ICONS.tank;
}

/**
 * Get icon key for a component ID
 * @param {string} componentId - Component ID
 * @returns {string} Icon key
 */
export function getIconForComponent(componentId) {
  return COMPONENT_ICON_MAP[componentId] || "tank";
}
