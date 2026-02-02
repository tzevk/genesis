"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/login/LoginForm";
import { getUserDataAsync } from "@/lib/utils";

type AppPhase = "splash" | "login" | "checking";

// Animated wave background component - defined outside to prevent re-creation
function WaveBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: "#2A6BB5" }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Blueprint circles */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.1]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circles" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="3" fill="white" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.3" />
            <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circles)" />
      </svg>
      
      {/* Floating gear outlines */}
      <motion.svg 
        className="absolute opacity-[0.12]" 
        style={{ top: "15%", right: "10%", width: "120px", height: "120px" }}
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <path 
          d="M50 20 L53 30 L60 28 L58 38 L68 42 L62 50 L68 58 L58 62 L60 72 L53 70 L50 80 L47 70 L40 72 L42 62 L32 58 L38 50 L32 42 L42 38 L40 28 L47 30 Z" 
          fill="none" 
          stroke="white" 
          strokeWidth="1"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="1" />
      </motion.svg>
      
      <motion.svg 
        className="absolute opacity-[0.1]" 
        style={{ bottom: "20%", left: "8%", width: "80px", height: "80px" }}
        viewBox="0 0 100 100"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <path 
          d="M50 15 L54 28 L65 24 L62 37 L75 43 L65 50 L75 57 L62 63 L65 76 L54 72 L50 85 L46 72 L35 76 L38 63 L25 57 L35 50 L25 43 L38 37 L35 24 L46 28 Z" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.8"
        />
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.8" />
      </motion.svg>
      
      {/* Technical measurement marks */}
      <div className="absolute top-0 left-0 right-0 h-8 opacity-[0.12] flex justify-around items-end">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-px bg-white" style={{ height: i % 5 === 0 ? "16px" : "8px" }} />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.12] flex justify-around items-start">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-px bg-white" style={{ height: i % 5 === 0 ? "16px" : "8px" }} />
        ))}
      </div>
      
      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-white opacity-[0.15]" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-white opacity-[0.15]" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-white opacity-[0.15]" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-white opacity-[0.15]" />
      
      {/* Animated gradient waves */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(42, 107, 181, 0.6) 0%, transparent 60%)",
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 10% 90%, rgba(42, 107, 181, 0.5) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.5, 0.3, 0.5],
          x: [0, 50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 90% 45% at 90% 85%, rgba(42, 107, 181, 0.5) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          x: [0, -40, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Aurora effect - top */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 120% 30% at 50% -10%, rgba(42, 107, 181, 0.4) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      
      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(20, 20, 60, 0.4) 100%)",
        }}
      />
    </div>
  );
}

export function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<AppPhase>("checking");

  // Check if user is already logged in - redirect them away from login
  useEffect(() => {
    const checkSession = async () => {
      const userData = await getUserDataAsync();
      if (userData) {
        // User is already logged in, redirect to appropriate page
        if (userData.sector) {
          // Has sector selected, go to canvas
          router.replace("/canvas");
        } else {
          // No sector yet, go to sector wheel
          router.replace("/sector-wheel");
        }
      } else {
        // No session, show splash screen
        setPhase("splash");
      }
    };
    checkSession();
  }, [router]);

  const handleEnterExperience = () => {
    setPhase("login");
  };

  const handleStartSimulation = () => {
    router.replace("/sector-wheel");
  };

  // Show nothing while checking session
  if (phase === "checking") {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#2A6BB5" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {/* SPLASH SCREEN */}
        {phase === "splash" && (
          <motion.div
            key="splash"
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleEnterExperience}
          >
            <WaveBackground />
<motion.div
  className="relative z-20 flex flex-col items-center mt-6 md:mt-10 space-y-4"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
>

  {/* Soft White Spotlight */}
  <motion.div
    className="absolute top-10 left-1/2 -translate-x-1/2 
               w-[130%] h-24 rounded-full blur-[60px] 
               bg-white/15 pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.4 }}
    transition={{ duration: 1.2, delay: 0.3 }}
  />

  {/* WHITE GLOW FIELD — Apple style */}
  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[850px] h-[850px] pointer-events-none">
    
    {/* Outer White Halo */}
    <motion.div
      className="absolute inset-0 bg-white/10 blur-[200px] rounded-full"
      animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.03, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Mid Soft Glow */}
    <motion.div
      className="absolute inset-0 bg-white/12 blur-[180px] rounded-full"
      animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.05, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Inner Core Glow */}
    <motion.div
      className="absolute inset-0 bg-white/14 blur-[130px] rounded-full"
      animate={{ opacity: [0.5, 0.75, 0.5], scale: [1, 1.07, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>

              {/* Typing GENESIS */}
              <h1 
                className="text-5xl xs:text-6xl sm:text-7xl md:text-9xl tracking-tight"
                style={{ 
                  color: "#FFFFFF",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                }}
              >
                {"GENESIS".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.5 + index * 0.12 }}
                  >
                    {letter}
                  </motion.span>
                ))}
                {/* Blinking period */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ 
                    duration: 1,
                    delay: 0.5 + 7 * 0.12,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ color: "#FAE452" }}
                >
                  .
                </motion.span>
              </h1>

  {/* PRESENTED BY */}
  <motion.p
    className="text-xs md:text-sm uppercase tracking-[0.35em] text-white/60 mt-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.2, duration: 0.8 }}
  >
    PRESENTED BY
  </motion.p>

  {/* LOGOS CONTAINER */}
  <motion.div
    className="relative px-2 py-1.5 rounded-lg"
    style={{
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    }}
    initial={{ scale: 0.92, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1.2, delay: 1.4 }}
  >
    <div className="flex flex-col xs:flex-row items-center justify-center gap-2 md:gap-3">

{/* ACCENT Logo Wrapper with Luminance Plate */}
<div className="relative">
  
  {/* White soft backlight for contrast */}
  <div className="absolute inset-0 blur-[18px] bg-white/35 rounded-lg pointer-events-none"></div>

  {/* ACCENT Logo */}
  <motion.img
    src="/ats.png"
    alt="Accent Techno Solutions"
    className="
      relative
      w-[110px] xs:w-[130px] md:w-[180px]
      contrast-[1.35] brightness-[1.15]
      drop-shadow-[0_0_14px_rgba(255,255,255,0.45)]
    "
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.5 }}
  />

</div>

    {/* Divider */}
    <motion.span
      className="text-white/50 text-3xl md:text-4xl font-light select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.6 }}
    >
      ×
    </motion.span>

{/* SIT Logo Wrapper with Larger Height */}
<div className="relative">

  {/* Stronger white glow */}
  <div className="absolute inset-0 blur-[26px] bg-white/40 rounded-lg pointer-events-none"></div>

  {/* SIT Logo — significantly increased height */}
  <motion.img
    src="/sit.png"
    alt="Suvidya Institute of Technology"
    className="
      relative
      w-auto
      h-[65px] xs:h-[75px] md:h-[100px]
      contrast-[1.38] brightness-[1.16]
      drop-shadow-[0_0_22px_rgba(255,255,255,0.50)]
      object-contain
    "
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.7 }}
  />

</div>

    </div>
  </motion.div>

            </motion.div>

            {/* Subtle tap indicator */}
            <motion.div
              className="absolute bottom-6 xs:bottom-8 sm:bottom-12 flex flex-col items-center gap-1.5 xs:gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              {/* Chevron up animation */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{ opacity: 0.5 }}
                  className="w-5 h-5 xs:w-6 xs:h-6"
                >
                  <path 
                    d="M18 15L12 9L6 15" 
                    stroke="#FFFFFF" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <motion.p
                className="text-[10px] xs:text-xs tracking-widest"
                style={{ color: "rgba(255, 255, 255, 0.93)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Tap anywhere to continue
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* LOGIN SCREEN */}
        {phase === "login" && (
          <motion.div
            key="login"
            className="fixed inset-0 overflow-y-auto overflow-x-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <WaveBackground />

            {/* Login Form - with safe area padding and scroll support */}
            <div 
              className="relative z-10 w-full min-h-screen flex items-center justify-center py-8 px-4"
              style={{ 
                paddingTop: "max(2rem, env(safe-area-inset-top))",
                paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
              }}
            >
              <LoginForm onStartSimulation={handleStartSimulation} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
