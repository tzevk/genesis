// User types
export type UserType = "student" | "professional";

export interface UserData {
  name: string;
  email: string;
  phone: string;
  educationLevel: string;
  companyName?: string;
  companyId?: string;
  userType?: UserType;
  businessCardFront?: string | null;
  businessCardBack?: string | null;
  sector?: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Sector types
export interface Sector {
  name: string;
  color: string;
  icon: string;
  description: string;
}
