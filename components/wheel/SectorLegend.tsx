"use client";

import { SECTORS } from "@/lib/constants";

export function SectorLegend() {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {SECTORS.map((sector) => {
        return (
          <div
            key={sector.name}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(250, 228, 82, 0.2)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "rgba(250, 228, 82, 0.7)" }}
            />
            <span className="text-xs tracking-wide" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {sector.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default SectorLegend;
