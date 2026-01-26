import { UserData, FormErrors } from "./types";

// Session ID key stored in sessionStorage (browser tab only, not persistent)
const SESSION_ID_KEY = "genesisSessionId";

// Extended user data type with database fields
export interface ExtendedUserData extends UserData {
  id?: string;
  sessionId?: string;
  bestScore?: number;
  lastScore?: number;
  attemptCount?: number;
}

// Get session ID from sessionStorage (tab-specific, cleared on tab close)
const getSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_ID_KEY);
};

// Set session ID in sessionStorage
const setSessionId = (sessionId: string): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
};

// Clear session ID from sessionStorage
const clearSessionId = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_ID_KEY);
  }
};

// API-based user login - creates session in MongoDB
export const loginUser = async (data: Omit<UserData, "sector">): Promise<ExtendedUserData & { id: string }> => {
  // First, authenticate with login API
  const loginResponse = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.json();
    throw new Error(error.error || "Login failed");
  }

  const loginResult = await loginResponse.json();
  const userData = loginResult.user;

  // Create a session in MongoDB
  const sessionResponse = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: userData.phone,
      name: userData.name,
      educationLevel: userData.educationLevel,
      sector: userData.sector,
    }),
  });

  if (sessionResponse.ok) {
    const sessionResult = await sessionResponse.json();
    // Store only the session ID in sessionStorage (minimal client-side storage)
    setSessionId(sessionResult.sessionId);
    userData.sessionId = sessionResult.sessionId;
  }

  return userData;
};

// Get user data from MongoDB session (no localStorage)
export const getUserData = (): ExtendedUserData | null => {
  // This is now a sync function that returns null
  // Use getUserDataAsync for actual data
  const sessionId = getSessionId();
  if (!sessionId) return null;
  // Return minimal data to indicate session exists
  // Actual data should be fetched via getUserDataAsync
  return { name: "", phone: "", educationLevel: "", sessionId } as ExtendedUserData;
};

// Fetch user data from MongoDB session
export const getUserDataAsync = async (): Promise<ExtendedUserData | null> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    return null;
  }

  try {
    const response = await fetch(`/api/session?sessionId=${encodeURIComponent(sessionId)}`);
    if (!response.ok) {
      // Session invalid or expired
      clearSessionId();
      return null;
    }
    
    const result = await response.json();
    if (result.success && result.session) {
      return {
        ...result.session,
        id: result.session.userId,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return null;
  }
};

// Update user sector in MongoDB (both session and user collections)
export const updateUserSector = async (sector: string): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    // Update session
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, sector }),
    });

    // Also update user record
    const sessionData = await getUserDataAsync();
    if (sessionData?.id) {
      await fetch("/api/user/sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: sessionData.id, sector }),
      });
    }
  } catch (error) {
    console.error("Failed to update sector:", error);
  }
};

// Clear user session (logout)
export const clearUserData = async (): Promise<void> => {
  const sessionId = getSessionId();
  if (sessionId) {
    try {
      await fetch(`/api/session?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }
  clearSessionId();
};

// Legacy sync version for backwards compatibility (deprecated)
export const saveUserData = (_data: ExtendedUserData): void => {
  // No-op: Data is now stored in MongoDB only
  console.warn("saveUserData is deprecated. Data is stored in MongoDB.");
};

// Fetch user data from database by phone (for internal use)
export const fetchUserFromDB = async (phone: string): Promise<ExtendedUserData | null> => {
  try {
    const response = await fetch(`/api/user?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) {
      return null;
    }
    const result = await response.json();
    if (result.success && result.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user from database:", error);
    return null;
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
