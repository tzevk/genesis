"use client";

/**
 * Timer - Countdown timer display
 * Shows remaining time with visual warning when low
 */

interface TimerProps {
  /** Time remaining in seconds */
  timeLeft: number;
}

export function Timer({ timeLeft }: TimerProps) {
  // Show warning styling when 30 seconds or less remain
  const isLow = timeLeft <= 30;
  
  // Format time as M:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ 
        background: isLow ? "rgba(239, 68, 68, 0.2)" : "rgba(250, 228, 82, 0.15)",
        border: isLow ? "1px solid #EF4444" : "1px solid rgba(250, 228, 82, 0.3)",
      }}
    >
      <span>⏱️</span>
      <span 
        className="text-lg font-bold font-mono"
        style={{ color: isLow ? "#EF4444" : "#FAE452" }}
      >
        {minutes}:{seconds}
      </span>
    </div>
  );
}
