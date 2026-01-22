"use client";

import { useEffect, useState } from "react";

interface NeonBackgroundProps {
  variant?: "login" | "wheel";
}

export function NeonBackground({ variant = "login" }: NeonBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.03),
        y: lerp(prev.y, mousePosition.y, 0.03),
      }));
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mousePosition]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-white via-slate-50 to-white">
      
      {/* Unified aurora gradient - Layer 1 (slowest, most subtle) */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${smoothPosition.x * 20}px, ${smoothPosition.y * 20}px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 150% 100% at 100% 0%,
                rgba(134, 40, 143, 0.25) 0%,
                rgba(100, 18, 109, 0.15) 20%,
                rgba(46, 48, 147, 0.08) 40%,
                transparent 60%
              )
            `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 130% 90% at 0% 100%,
                rgba(42, 107, 181, 0.22) 0%,
                rgba(46, 48, 147, 0.12) 25%,
                rgba(42, 107, 181, 0.05) 45%,
                transparent 65%
              )
            `,
          }}
        />
      </div>

      {/* Flowing mid layer - Layer 2 */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${smoothPosition.x * 45}px, ${smoothPosition.y * 45}px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 70% at 80% 30%,
                rgba(134, 40, 143, 0.18) 0%,
                rgba(134, 40, 143, 0.06) 35%,
                transparent 55%
              )
            `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 60% at 15% 70%,
                rgba(42, 107, 181, 0.16) 0%,
                rgba(42, 107, 181, 0.05) 40%,
                transparent 60%
              )
            `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 50% 40% at 60% 80%,
                rgba(250, 228, 82, 0.12) 0%,
                rgba(250, 228, 82, 0.04) 40%,
                transparent 60%
              )
            `,
          }}
        />
      </div>

      {/* Fast response accent - Layer 3 */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${smoothPosition.x * 80}px, ${smoothPosition.y * 80}px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 40% 35% at 75% 25%,
                rgba(100, 18, 109, 0.2) 0%,
                transparent 50%
              )
            `,
            filter: "blur(30px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 35% 30% at 20% 75%,
                rgba(42, 107, 181, 0.18) 0%,
                transparent 50%
              )
            `,
            filter: "blur(25px)",
          }}
        />
      </div>

      {/* Breathing ambient orbs */}
      <div className="absolute inset-0">
        <div
          className="absolute top-[5%] right-[5%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(134, 40, 143, 0.15) 0%, rgba(134, 40, 143, 0.05) 40%, transparent 70%)",
            filter: "blur(80px)",
            animation: "breathe 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[0%] left-[0%] w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(42, 107, 181, 0.12) 0%, rgba(42, 107, 181, 0.04) 40%, transparent 70%)",
            filter: "blur(100px)",
            animation: "breathe 15s ease-in-out 3s infinite",
          }}
        />
        <div
          className="absolute top-[35%] left-[25%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46, 48, 147, 0.08) 0%, transparent 60%)",
            filter: "blur(60px)",
            animation: "breathe 18s ease-in-out 6s infinite",
          }}
        />
      </div>

      {/* Elegant accent lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute h-[1px] w-[70%] top-[30%] left-[15%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(134, 40, 143, 0.15) 30%, rgba(42, 107, 181, 0.15) 70%, transparent)",
            animation: "shimmer 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute h-[1px] w-[60%] top-[70%] left-[20%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(42, 107, 181, 0.12) 40%, rgba(134, 40, 143, 0.12) 60%, transparent)",
            animation: "shimmer 25s ease-in-out 5s infinite",
          }}
        />
      </div>

      {/* Soft center glow for content focus */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[85vh]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, transparent 70%)",
        }}
      />

      {/* Premium vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(100, 18, 109, 0.04) 100%)",
        }}
      />

      <style jsx>{`
        @keyframes breathe {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.3;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}

export default NeonBackground;

