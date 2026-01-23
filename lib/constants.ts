import { Sector } from "./types";

// Education levels for registration
export const EDUCATION_LEVELS = [
  "HSC",
  "Diploma",
  "Graduate",
  "Others",
] as const;

// EPC Sectors with brand colors
export const SECTORS: Sector[] = [
  {
    name: "Process",
    color: "#2A6BB5",
    icon: "process",
    description: "chemical and industrial processes",
  },
  {
    name: "HVAC",
    color: "#86288F",
    icon: "hvac",
    description: "heating, ventilation, and air conditioning systems",
  },
  {
    name: "Oil & Gas",
    color: "#FAE452",
    icon: "oilgas",
    description: "oil and gas processing facilities",
  },
  {
    name: "Electrical",
    color: "#64126D",
    icon: "electrical",
    description: "electrical power systems",
  },
  {
    name: "MEP",
    color: "#2E3093",
    icon: "mep",
    description: "mechanical, electrical, and plumbing systems",
  },
];

// Brand color palette
export const NEON_COLORS = {
  darkPurple: "#64126D",
  purple: "#86288F",
  darkBlue: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
} as const;

// Animation durations
export const ANIMATION = {
  wheelSpinDuration: 4000,
  minRotations: 5,
  maxRotations: 10,
} as const;
