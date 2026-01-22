"use client";

import { SECTORS } from "@/lib/constants";

interface WheelResultProps {
  selectedSector: string;
  onProceed: () => void;
}

export function WheelResult({ selectedSector, onProceed }: WheelResultProps) {
  const sector = SECTORS.find((s) => s.name === selectedSector);

  if (!sector) return null;

  return (
    <div className="animate-fade-in">
      <div
        className="rounded-lg p-6 mb-6 max-w-sm mx-auto"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(250, 228, 82, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="text-sm mb-2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
          Your assigned sector is
        </p>
        <h2
          className="text-2xl font-light mb-3 tracking-wide"
          style={{ color: "#FAE452" }}
        >
          {selectedSector}
        </h2>
        <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Get ready to build and design {sector.description}!
        </p>
      </div>

      <button
        onClick={onProceed}
        className="px-8 py-3 rounded-full text-sm tracking-wider font-medium transition-all duration-300"
        style={{
          background: "rgba(250, 228, 82, 0.15)",
          border: "1px solid rgba(250, 228, 82, 0.5)",
          color: "#FAE452",
        }}
      >
        CONTINUE
      </button>
    </div>
  );
}

export default WheelResult;
