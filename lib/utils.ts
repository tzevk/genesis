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
      email: userData.email,
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
export const validateLoginForm = (
  formData: Omit<UserData, "sector">,
  userType: "student" | "professional" = "student",
  _useBusinessCard: boolean = false
): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (userType === "student") {
    // Student validation: name, email, phone, education level
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.educationLevel) {
      errors.educationLevel = "Please select your education level";
    }
  } else {
    // Professional validation: name, company name, location
    // Business card images are optional
    if (!formData.companyName?.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!formData.companyLocation?.trim()) {
      errors.companyLocation = "Location is required";
    }
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

// ============================================
// LOCAL BACKUP UTILITIES FOR DATA LOSS PREVENTION
// ============================================

const BACKUP_KEY = "genesisUnsavedData";
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export interface UnsavedScoreData {
  phone: string;
  sector: string;
  score: number;
  slots: number;
  timeLeft: number;
  completedAt: string;
  attemptCount: number;
  timestamp: number;
}

// Save data to local backup
export const saveToLocalBackup = (data: UnsavedScoreData): void => {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalBackups();
    // Add new data, keep max 5 backups
    const updated = [data, ...existing].slice(0, 5);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(updated));
    console.log("Data backed up locally:", data);
  } catch (error) {
    console.error("Failed to save local backup:", error);
  }
};

// Get all local backups
export const getLocalBackups = (): UnsavedScoreData[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(BACKUP_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Remove a specific backup after successful save
export const removeFromLocalBackup = (timestamp: number): void => {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalBackups();
    const updated = existing.filter(item => item.timestamp !== timestamp);
    if (updated.length > 0) {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(updated));
    } else {
      localStorage.removeItem(BACKUP_KEY);
    }
    console.log("Backup removed after successful save");
  } catch (error) {
    console.error("Failed to remove local backup:", error);
  }
};

// Clear all local backups
export const clearAllLocalBackups = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch (error) {
    console.error("Failed to clear local backups:", error);
  }
};

// Retry helper with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Save score with retry and local backup
export const saveScoreWithBackup = async (
  data: Omit<UnsavedScoreData, "timestamp" | "attemptCount">
): Promise<{ success: boolean; isNewHighScore?: boolean; error?: string }> => {
  const timestamp = Date.now();
  const backupData: UnsavedScoreData = { ...data, timestamp, attemptCount: 0 };
  
  // Save to local backup first
  saveToLocalBackup(backupData);
  
  // Try to save to server with retries
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch("/api/user/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.phone,
          sector: data.sector,
          score: data.score,
          slots: data.slots,
          timeLeft: data.timeLeft,
          completedAt: data.completedAt,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Success - remove from local backup
        removeFromLocalBackup(timestamp);
        return { 
          success: true, 
          isNewHighScore: result.isNewHighScore 
        };
      }
      
      // Server returned error, retry if not final attempt
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.warn(`Save attempt ${attempt} failed, retrying...`);
        await delay(RETRY_DELAY_MS * attempt);
      }
    } catch (error) {
      // Network error, retry if not final attempt
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.warn(`Network error on attempt ${attempt}, retrying...`);
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }
  
  // All retries failed - data remains in local backup
  console.error("Failed to save score after all retries. Data saved locally for recovery.");
  return { 
    success: false, 
    error: "Failed to save. Your score has been backed up locally." 
  };
};

// Sync any pending local backups to server (call on app init)
export const syncPendingBackups = async (): Promise<number> => {
  const backups = getLocalBackups();
  if (backups.length === 0) return 0;
  
  console.log(`Found ${backups.length} unsaved score(s). Attempting to sync...`);
  let syncedCount = 0;
  
  for (const backup of backups) {
    try {
      const response = await fetch("/api/user/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: backup.phone,
          sector: backup.sector,
          score: backup.score,
          slots: backup.slots,
          timeLeft: backup.timeLeft,
          completedAt: backup.completedAt,
        }),
      });
      
      if (response.ok) {
        removeFromLocalBackup(backup.timestamp);
        syncedCount++;
        console.log(`Synced backup from ${new Date(backup.timestamp).toISOString()}`);
      }
    } catch (error) {
      console.error("Failed to sync backup:", error);
    }
  }
  
  return syncedCount;
};
