// User types
export interface UserData {
  name: string;
  phone: string;
  educationLevel: string;
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
