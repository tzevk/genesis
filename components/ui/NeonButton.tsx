"use client";

import { NeonButtonProps } from "@/lib/types";
import { LoadingSpinner } from "@/components/icons";

export function NeonButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
  className = "",
}: NeonButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 font-medium text-lg rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ 
        backgroundColor: '#FAE452',
        color: '#0a4d8c',
        boxShadow: '0 0 20px rgba(250, 228, 82, 0.3)'
      }}
    >
      {children}
    </button>
  );
}

export function SubmitButton({
  isLoading,
  loadingText = "Loading...",
  children,
}: {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{ 
        backgroundColor: '#FAE452',
        color: '#0a4d8c',
        boxShadow: '0 0 20px rgba(250, 228, 82, 0.3)'
      }}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default NeonButton;
