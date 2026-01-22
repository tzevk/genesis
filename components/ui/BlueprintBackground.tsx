"use client";

export function BlueprintBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ backgroundColor: "#0a4d8c" }}>
      {/* Blueprint paper texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Blueprint grid using SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fine grid lines (3px spacing) */}
        {Array.from({ length: 700 }).map((_, i) => (
          <line
            key={`fh-${i}`}
            x1="0"
            y1={i * 3}
            x2="100%"
            y2={i * 3}
            stroke="#FAE452"
            strokeWidth="0.2"
            strokeOpacity="0.15"
          />
        ))}
        {Array.from({ length: 1000 }).map((_, i) => (
          <line
            key={`fv-${i}`}
            x1={i * 3}
            y1="0"
            x2={i * 3}
            y2="100%"
            stroke="#FAE452"
            strokeWidth="0.2"
            strokeOpacity="0.15"
          />
        ))}
        
        {/* Medium grid lines (15px spacing) */}
        {Array.from({ length: 140 }).map((_, i) => (
          <line
            key={`mh-${i}`}
            x1="0"
            y1={i * 15}
            x2="100%"
            y2={i * 15}
            stroke="#FAE452"
            strokeWidth="0.4"
            strokeOpacity="0.25"
          />
        ))}
        {Array.from({ length: 200 }).map((_, i) => (
          <line
            key={`mv-${i}`}
            x1={i * 15}
            y1="0"
            x2={i * 15}
            y2="100%"
            stroke="#FAE452"
            strokeWidth="0.4"
            strokeOpacity="0.25"
          />
        ))}
        
        {/* Main grid lines (30px spacing) */}
        {Array.from({ length: 70 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 30}
            x2="100%"
            y2={i * 30}
            stroke="#FAE452"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        ))}
        {Array.from({ length: 100 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 30}
            y1="0"
            x2={i * 30}
            y2="100%"
            stroke="#FAE452"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        ))}
      </svg>

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(5, 40, 80, 0.5) 100%)",
        }}
      />

      {/* Engineering decorative elements */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Compass rose in corner */}
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="30" fill="none" stroke="#FAE452" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="25" fill="none" stroke="#FAE452" strokeWidth="0.3" />
          <line x1="0" y1="-35" x2="0" y2="35" stroke="#FAE452" strokeWidth="0.5" />
          <line x1="-35" y1="0" x2="35" y2="0" stroke="#FAE452" strokeWidth="0.5" />
          <line x1="-25" y1="-25" x2="25" y2="25" stroke="#FAE452" strokeWidth="0.3" />
          <line x1="25" y1="-25" x2="-25" y2="25" stroke="#FAE452" strokeWidth="0.3" />
        </g>

        {/* Technical drawing marks - top right */}
        <g transform="translate(calc(100% - 80), 40)" style={{ transform: "translate(calc(100% - 80px), 40px)" }}>
          <rect x="0" y="0" width="60" height="40" fill="none" stroke="#FAE452" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="60" y2="20" stroke="#FAE452" strokeWidth="0.3" />
          <line x1="30" y1="0" x2="30" y2="40" stroke="#FAE452" strokeWidth="0.3" />
        </g>

        {/* Dimension lines - bottom */}
        <g className="opacity-30">
          <line x1="10%" y1="95%" x2="90%" y2="95%" stroke="#FAE452" strokeWidth="0.5" />
          <line x1="10%" y1="93%" x2="10%" y2="97%" stroke="#FAE452" strokeWidth="0.5" />
          <line x1="90%" y1="93%" x2="90%" y2="97%" stroke="#FAE452" strokeWidth="0.5" />
          <line x1="50%" y1="94%" x2="50%" y2="96%" stroke="#FAE452" strokeWidth="0.3" />
        </g>

        {/* Corner brackets */}
        <path d="M 20 10 L 10 10 L 10 20" fill="none" stroke="#FAE452" strokeWidth="0.8" />
        <path d="M calc(100% - 20) 10 L calc(100% - 10) 10 L calc(100% - 10) 20" fill="none" stroke="#FAE452" strokeWidth="0.8" style={{ transform: "translate(-20px, 0)" }} />
      </svg>
    </div>
  );
}
