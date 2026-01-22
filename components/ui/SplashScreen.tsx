"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PartnerLogos } from "@/components/login/PartnerLogos";
import { LoginForm } from "@/components/login/LoginForm";
import { SimulationTransition } from "@/components/ui/SimulationTransition";

type AppPhase = "story" | "transitioning";

export function SplashScreen() {
  const router = useRouter();
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Simulation state
  const [phase, setPhase] = useState<AppPhase>("story");

  const fullText = "Genesis";

  useEffect(() => {
    // Wait 2 seconds before starting to type
    const startDelay = setTimeout(() => {
      setShowCursor(true);
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
        }
      }, 150); // Typing speed

      return () => clearInterval(typingInterval);
    }, 2000);

    return () => clearTimeout(startDelay);
  }, []);

  // Flickering effect for the full stop
  useEffect(() => {
    if (!isTypingComplete) return;

    const flickerInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500); // Flicker speed

    return () => clearInterval(flickerInterval);
  }, [isTypingComplete]);

  // Handle simulation launch
  const handleStartSimulation = () => {
    setPhase("transitioning");
  };

  // Handle transition complete - redirect to wheel page
  const handleTransitionComplete = () => {
    router.push("/sector-wheel");
  };

  // Blueprint background component
  const BlueprintBackground = () => (
    <>
      {/* Blueprint paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Blueprint grid using SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
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
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(5, 40, 80, 0.5) 100%)",
        }}
      />
    </>
  );

  return (
    <>
      {/* Simulation Transition Overlay */}
      <SimulationTransition 
        isActive={phase === "transitioning"} 
        onComplete={handleTransitionComplete} 
      />

      <AnimatePresence mode="wait">
        {/* STORY PHASE - Scrollable sections */}
        {phase === "story" && (
          <motion.main 
            key="story"
            style={{ backgroundColor: "#0a4d8c" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* SECTION 1 - Genesis */}
            <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden">
              <BlueprintBackground />
              
              <div className="flex items-baseline relative z-10">
                <h1
                  className="text-6xl md:text-8xl font-bold tracking-tight"
                  style={{ 
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    color: "#f0f8ff",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.3)"
                  }}
                >
                  {displayText}
                </h1>
                {showCursor && (
                  <span
                    className={`text-6xl md:text-8xl font-bold transition-opacity duration-100 ${
                      isTypingComplete
                        ? cursorVisible
                          ? "opacity-100"
                          : "opacity-0"
                        : "opacity-100"
                    }`}
                    style={{ 
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      color: "#f0f8ff",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)"
                    }}
                  >
                    .
                  </span>
                )}
              </div>

              {/* Scroll hint */}
              {isTypingComplete && (
                <p 
                  className="mt-16 animate-bounce text-sm z-10"
                  style={{ color: "#b8dff7", opacity: 0.6 }}
                >
                  Scroll ↓
                </p>
              )}
            </section>

            {/* SECTION 2 - EPC Text */}
            <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
              <BlueprintBackground />
              
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-2xl md:text-4xl max-w-3xl text-center px-8 z-10 font-light leading-relaxed"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  color: "#f0f8ff",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.2)"
                }}
              >
                Every industrial plant begins with{" "}
                <span className="font-semibold" style={{ color: "#FAE452" }}>Engineering</span>,{" "}
                <span className="font-semibold" style={{ color: "#FAE452" }}>Procurement</span>, and{" "}
                <span className="font-semibold" style={{ color: "#FAE452" }}>Construction</span>.
              </motion.p>

              {/* Scroll hint */}
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="mt-16 animate-bounce text-sm z-10"
                style={{ color: "#b8dff7" }}
              >
                Scroll ↓
              </motion.p>
            </section>

            {/* SECTION 3 - Login Form */}
            <section className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
              <BlueprintBackground />
              
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 w-full max-w-md"
              >
                <PartnerLogos />
                <LoginForm onStartSimulation={handleStartSimulation} />
              </motion.div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
