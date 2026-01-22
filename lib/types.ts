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

// Component prop types
export interface InputFieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  error?: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "success" | "secondary";
  className?: string;
}
