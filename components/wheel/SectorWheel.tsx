"use client";

import { SECTORS } from "@/lib/constants";

interface SectorWheelProps {
  rotation: number;
}

export function SectorWheel({ rotation }: SectorWheelProps) {
  const totalSectors = SECTORS.length;
  const anglePerSector = 360 / totalSectors;
  const totalTicks = 60; // Precision instrument ticks

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto mb-6">
      {/* Pointer - minimal line */}
      <WheelPointer />

      {/* Wheel container */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Outer precision rings - more visible */}
          <circle
            cx="100"
            cy="100"
            r="97"
            fill="none"
            stroke="rgba(250, 228, 82, 0.6)"
            strokeWidth="1.5"
          />
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="rgba(250, 228, 82, 0.3)"
            strokeWidth="0.5"
          />

          {/* Fine radial tick marks - 60 divisions, more visible */}
          {Array.from({ length: totalTicks }).map((_, i) => {
            const angle = (i * 360 / totalTicks) * Math.PI / 180;
            const isMajor = i % (totalTicks / totalSectors) === 0;
            const isMedium = i % 3 === 0;
            const innerR = isMajor ? 72 : isMedium ? 82 : 87;
            const outerR = 94;
            return (
              <line
                key={`tick-${i}`}
                x1={100 + innerR * Math.cos(angle)}
                y1={100 + innerR * Math.sin(angle)}
                x2={100 + outerR * Math.cos(angle)}
                y2={100 + outerR * Math.sin(angle)}
                stroke="rgba(250, 228, 82, 0.8)"
                strokeWidth={isMajor ? "1.5" : isMedium ? "0.8" : "0.3"}
              />
            );
          })}

          {/* Sector divider lines - more visible */}
          {SECTORS.map((_, index) => {
            const angle = (index * anglePerSector) * Math.PI / 180;
            return (
              <line
                key={`div-${index}`}
                x1={100 + 32 * Math.cos(angle)}
                y1={100 + 32 * Math.sin(angle)}
                x2={100 + 72 * Math.cos(angle)}
                y2={100 + 72 * Math.sin(angle)}
                stroke="rgba(250, 228, 82, 0.7)"
                strokeWidth="1"
              />
            );
          })}

          {/* Sector labels - positioned along arc, more visible */}
          {SECTORS.map((sector, index) => {
            const midAngle = ((index + 0.5) * anglePerSector) * Math.PI / 180;
            const labelRadius = 52;
            const labelX = 100 + labelRadius * Math.cos(midAngle);
            const labelY = 100 + labelRadius * Math.sin(midAngle);
            const rotationDeg = (index + 0.5) * anglePerSector;

            return (
              <text
                key={sector.name}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FAE452"
                fontSize="7"
                fontWeight="500"
                letterSpacing="0.8"
                style={{
                  transform: `rotate(${rotationDeg + 90}deg)`,
                  transformOrigin: `${labelX}px ${labelY}px`,
                }}
              >
                {sector.name.toUpperCase()}
              </text>
            );
          })}

          {/* Inner reference circle */}
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="rgba(250, 228, 82, 0.25)"
            strokeWidth="0.5"
          />

          {/* Glass center control */}
          <defs>
            <radialGradient id="glassCenter" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(250, 228, 82, 0.1)" />
              <stop offset="100%" stopColor="rgba(10, 77, 140, 0.4)" />
            </radialGradient>
          </defs>
          
          {/* Center disc */}
          <circle
            cx="100"
            cy="100"
            r="28"
            fill="url(#glassCenter)"
            stroke="rgba(250, 228, 82, 0.5)"
            strokeWidth="1"
          />
          
          {/* Center precision dot */}
          <circle
            cx="100"
            cy="100"
            r="3"
            fill="#FAE452"
          />
          <circle
            cx="100"
            cy="100"
            r="6"
            fill="none"
            stroke="rgba(250, 228, 82, 0.4)"
            strokeWidth="0.5"
          />

          {/* Crosshair in center */}
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="110"
            stroke="rgba(250, 228, 82, 0.3)"
            strokeWidth="0.5"
          />
          <line
            x1="90"
            y1="100"
            x2="110"
            y2="100"
            stroke="rgba(250, 228, 82, 0.3)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </div>
  );
}

function WheelPointer() {
  return (
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
      <svg width="24" height="36" viewBox="0 0 24 36">
        {/* Line pointer with glow */}
        <line
          x1="12"
          y1="0"
          x2="12"
          y2="28"
          stroke="#FAE452"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Triangle tip */}
        <polygon
          points="12,36 6,24 18,24"
          fill="#FAE452"
        />
      </svg>
    </div>
  );
}

export default SectorWheel;
