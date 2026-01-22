import { UserData, FormErrors } from "./types";

// Local storage keys
const USER_STORAGE_KEY = "genesisUser";

// API-based user login
export const loginUser = async (data: Omit<UserData, "sector">): Promise<UserData & { id: string }> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const result = await response.json();
  
  // Also save to localStorage for client-side access
  const userData = result.user;
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }
  
  return userData;
};

// User data management (localStorage for quick client access)
export const saveUserData = (data: UserData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
  }
};

export const getUserData = (): (UserData & { id?: string }) | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const updateUserSector = async (sector: string): Promise<void> => {
  const userData = getUserData();
  if (userData) {
    // Update localStorage immediately for UI
    userData.sector = sector;
    saveUserData(userData);
    
    // Update in database if user has an ID
    if (userData.id) {
      try {
        await fetch("/api/user/sector", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData.id, sector }),
        });
      } catch (error) {
        console.error("Failed to update sector in database:", error);
      }
    }
  }
};

export const clearUserData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

// Form validation
export const validateLoginForm = (formData: Omit<UserData, "sector">): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  if (!formData.educationLevel) {
    errors.educationLevel = "Please select your education level";
  }

  return errors;
};

// Wheel calculation utilities
export const calculateWheelRotation = (
  currentRotation: number,
  sectorIndex: number,
  totalSectors: number,
  minRotations: number,
  maxRotations: number
): number => {
  const fullRotations = minRotations + Math.floor(Math.random() * (maxRotations - minRotations));
  const sectorAngle = (360 / totalSectors) * sectorIndex;
  return fullRotations * 360 + sectorAngle + currentRotation;
};

// Generate random position for particles
export const getRandomPosition = (min: number = 10, max: number = 80): number => {
  return min + Math.random() * (max - min);
};

// Generate random animation delay
export const getRandomDelay = (maxSeconds: number = 3): number => {
  return Math.random() * maxSeconds;
};

// Generate random duration
export const getRandomDuration = (base: number = 2, variance: number = 2): number => {
  return base + Math.random() * variance;
};
