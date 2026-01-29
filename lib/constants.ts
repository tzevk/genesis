import { Sector } from "./types";

// Education levels for registration
export const EDUCATION_LEVELS = [
  "HSC",
  "Diploma",
  "Graduate",
  "Others",
] as const;

// Locations with coordinates for globe display
export const LOCATIONS = [
  // India
  { label: "Mumbai, India", value: "Mumbai", coords: [19.076, 72.8777] as [number, number] },
  { label: "Delhi, India", value: "Delhi", coords: [28.6139, 77.209] as [number, number] },
  { label: "Bangalore, India", value: "Bangalore", coords: [12.9716, 77.5946] as [number, number] },
  { label: "Chennai, India", value: "Chennai", coords: [13.0827, 80.2707] as [number, number] },
  { label: "Hyderabad, India", value: "Hyderabad", coords: [17.385, 78.4867] as [number, number] },
  { label: "Kolkata, India", value: "Kolkata", coords: [22.5726, 88.3639] as [number, number] },
  { label: "Pune, India", value: "Pune", coords: [18.5204, 73.8567] as [number, number] },
  { label: "Ahmedabad, India", value: "Ahmedabad", coords: [23.0225, 72.5714] as [number, number] },
  { label: "Jaipur, India", value: "Jaipur", coords: [26.9124, 75.7873] as [number, number] },
  { label: "Surat, India", value: "Surat", coords: [21.1702, 72.8311] as [number, number] },
  { label: "Lucknow, India", value: "Lucknow", coords: [26.8467, 80.9462] as [number, number] },
  { label: "Nagpur, India", value: "Nagpur", coords: [21.1458, 79.0882] as [number, number] },
  { label: "Indore, India", value: "Indore", coords: [22.7196, 75.8577] as [number, number] },
  { label: "Bhopal, India", value: "Bhopal", coords: [23.2599, 77.4126] as [number, number] },
  { label: "Vadodara, India", value: "Vadodara", coords: [22.3072, 73.1812] as [number, number] },
  { label: "Coimbatore, India", value: "Coimbatore", coords: [11.0168, 76.9558] as [number, number] },
  { label: "Kochi, India", value: "Kochi", coords: [9.9312, 76.2673] as [number, number] },
  { label: "Gurugram, India", value: "Gurugram", coords: [28.4595, 77.0266] as [number, number] },
  { label: "Noida, India", value: "Noida", coords: [28.5355, 77.391] as [number, number] },
  
  // USA
  { label: "New York, USA", value: "New York", coords: [40.7128, -74.006] as [number, number] },
  { label: "Los Angeles, USA", value: "Los Angeles", coords: [34.0522, -118.2437] as [number, number] },
  { label: "Chicago, USA", value: "Chicago", coords: [41.8781, -87.6298] as [number, number] },
  { label: "Houston, USA", value: "Houston", coords: [29.7604, -95.3698] as [number, number] },
  { label: "San Francisco, USA", value: "San Francisco", coords: [37.7749, -122.4194] as [number, number] },
  { label: "Seattle, USA", value: "Seattle", coords: [47.6062, -122.3321] as [number, number] },
  { label: "Boston, USA", value: "Boston", coords: [42.3601, -71.0589] as [number, number] },
  { label: "Miami, USA", value: "Miami", coords: [25.7617, -80.1918] as [number, number] },
  { label: "Dallas, USA", value: "Dallas", coords: [32.7767, -96.797] as [number, number] },
  { label: "Atlanta, USA", value: "Atlanta", coords: [33.749, -84.388] as [number, number] },
  
  // UK
  { label: "London, UK", value: "London", coords: [51.5074, -0.1278] as [number, number] },
  { label: "Manchester, UK", value: "Manchester", coords: [53.4808, -2.2426] as [number, number] },
  { label: "Birmingham, UK", value: "Birmingham", coords: [52.4862, -1.8904] as [number, number] },
  { label: "Edinburgh, UK", value: "Edinburgh", coords: [55.9533, -3.1883] as [number, number] },
  
  // Europe
  { label: "Paris, France", value: "Paris", coords: [48.8566, 2.3522] as [number, number] },
  { label: "Berlin, Germany", value: "Berlin", coords: [52.52, 13.405] as [number, number] },
  { label: "Amsterdam, Netherlands", value: "Amsterdam", coords: [52.3676, 4.9041] as [number, number] },
  { label: "Frankfurt, Germany", value: "Frankfurt", coords: [50.1109, 8.6821] as [number, number] },
  { label: "Munich, Germany", value: "Munich", coords: [48.1351, 11.582] as [number, number] },
  { label: "Zurich, Switzerland", value: "Zurich", coords: [47.3769, 8.5417] as [number, number] },
  { label: "Milan, Italy", value: "Milan", coords: [45.4642, 9.19] as [number, number] },
  { label: "Madrid, Spain", value: "Madrid", coords: [40.4168, -3.7038] as [number, number] },
  { label: "Barcelona, Spain", value: "Barcelona", coords: [41.3851, 2.1734] as [number, number] },
  { label: "Dublin, Ireland", value: "Dublin", coords: [53.3498, -6.2603] as [number, number] },
  
  // Middle East
  { label: "Dubai, UAE", value: "Dubai", coords: [25.2048, 55.2708] as [number, number] },
  { label: "Abu Dhabi, UAE", value: "Abu Dhabi", coords: [24.4539, 54.3773] as [number, number] },
  { label: "Riyadh, Saudi Arabia", value: "Riyadh", coords: [24.7136, 46.6753] as [number, number] },
  { label: "Doha, Qatar", value: "Doha", coords: [25.2854, 51.531] as [number, number] },
  { label: "Kuwait City, Kuwait", value: "Kuwait City", coords: [29.3759, 47.9774] as [number, number] },
  { label: "Muscat, Oman", value: "Muscat", coords: [23.588, 58.3829] as [number, number] },
  
  // Asia
  { label: "Singapore", value: "Singapore", coords: [1.3521, 103.8198] as [number, number] },
  { label: "Tokyo, Japan", value: "Tokyo", coords: [35.6762, 139.6503] as [number, number] },
  { label: "Hong Kong", value: "Hong Kong", coords: [22.3193, 114.1694] as [number, number] },
  { label: "Seoul, South Korea", value: "Seoul", coords: [37.5665, 126.978] as [number, number] },
  { label: "Shanghai, China", value: "Shanghai", coords: [31.2304, 121.4737] as [number, number] },
  { label: "Beijing, China", value: "Beijing", coords: [39.9042, 116.4074] as [number, number] },
  { label: "Bangkok, Thailand", value: "Bangkok", coords: [13.7563, 100.5018] as [number, number] },
  { label: "Kuala Lumpur, Malaysia", value: "Kuala Lumpur", coords: [3.139, 101.6869] as [number, number] },
  { label: "Jakarta, Indonesia", value: "Jakarta", coords: [-6.2088, 106.8456] as [number, number] },
  
  // Australia
  { label: "Sydney, Australia", value: "Sydney", coords: [-33.8688, 151.2093] as [number, number] },
  { label: "Melbourne, Australia", value: "Melbourne", coords: [-37.8136, 144.9631] as [number, number] },
  { label: "Brisbane, Australia", value: "Brisbane", coords: [-27.4698, 153.0251] as [number, number] },
  
  // Canada
  { label: "Toronto, Canada", value: "Toronto", coords: [43.6532, -79.3832] as [number, number] },
  { label: "Vancouver, Canada", value: "Vancouver", coords: [49.2827, -123.1207] as [number, number] },
  { label: "Montreal, Canada", value: "Montreal", coords: [45.5017, -73.5673] as [number, number] },
  
  // Africa
  { label: "Johannesburg, South Africa", value: "Johannesburg", coords: [-26.2041, 28.0473] as [number, number] },
  { label: "Cape Town, South Africa", value: "Cape Town", coords: [-33.9249, 18.4241] as [number, number] },
  { label: "Cairo, Egypt", value: "Cairo", coords: [30.0444, 31.2357] as [number, number] },
  { label: "Lagos, Nigeria", value: "Lagos", coords: [6.5244, 3.3792] as [number, number] },
  
  // South America
  { label: "São Paulo, Brazil", value: "São Paulo", coords: [-23.5505, -46.6333] as [number, number] },
  { label: "Rio de Janeiro, Brazil", value: "Rio de Janeiro", coords: [-22.9068, -43.1729] as [number, number] },
  { label: "Buenos Aires, Argentina", value: "Buenos Aires", coords: [-34.6037, -58.3816] as [number, number] },
  
  // Other
  { label: "Other", value: "Other", coords: [20.5937, 78.9629] as [number, number] },
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
  {
    name: "Industry Quiz",
    color: "#00A86B",
    icon: "quiz",
    description: "test your industry knowledge",
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
