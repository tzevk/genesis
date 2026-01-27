"use client";

/**
 * Timer - Apple-style circular ring timer
 * Features:
 * - Circular progress ring that depletes
 * - Yellow glow when <30s remaining
 * - Subtle pulse animation when low
 */

interface TimerProps {
  /** Time remaining in seconds */
  timeLeft: number;
  /** Total duration in seconds (default 150 = 2:30) */
  totalTime?: number;
}

export function Timer({ timeLeft, totalTime = 150 }: TimerProps) {
  // Show warning styling when 30 seconds or less remain
  const isLow = timeLeft <= 30;
  const isCritical = timeLeft <= 10;
  
  // Format time as M:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  // Calculate progress (0 to 1)
  const progress = timeLeft / totalTime;
  
  // SVG circle properties - smaller size
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Colors
  const ringColor = isCritical ? "#EF4444" : isLow ? "#FAE452" : "#FAE452";
  const bgRingColor = isLow ? "rgba(250, 228, 82, 0.15)" : "rgba(42, 107, 181, 0.3)";
  const textColor = isCritical ? "#EF4444" : "#FAE452";
  const glowColor = isLow ? `0 0 12px ${ringColor}60, 0 0 24px ${ringColor}30` : "none";
  
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: isLow ? `drop-shadow(0 0 6px ${ringColor}50)` : "none",
      }}
    >
      {/* Pulse animation overlay when low */}
      {isLow && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${ringColor}20 0%, transparent 70%)`,
            animation: isCritical 
              ? "timer-pulse 0.5s ease-in-out infinite" 
              : "timer-pulse 1s ease-in-out infinite",
          }}
        />
      )}
      
      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: isLow ? `drop-shadow(${glowColor})` : "none" }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgRingColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
          }}
        />
        
        {/* Glow effect ring when low */}
        {isLow && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            opacity={0.3}
            style={{
              transition: "stroke-dashoffset 1s linear",
              filter: "blur(3px)",
            }}
          />
        )}
      </svg>
      
      {/* Center time display */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
      >
        <span 
          className="text-[10px] font-bold font-mono"
          style={{ 
            color: textColor,
            textShadow: isLow ? `0 0 8px ${ringColor}80` : "none",
            animation: isCritical ? "timer-text-pulse 0.5s ease-in-out infinite" : "none",
          }}
        >
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  );
}
