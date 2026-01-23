"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/login/LoginForm";

type AppPhase = "splash" | "login";

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
  const [phase, setPhase] = useState<AppPhase>("splash");

  const handleEnterExperience = () => {
    setPhase("login");
  };

  const handleStartSimulation = () => {
    router.push("/sector-wheel");
  };

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

            {/* Center Content - GENESIS with Typing Animation */}
            <motion.div 
              className="relative z-10 text-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              {/* Typing GENESIS */}
              <h1 
                className="text-6xl md:text-8xl tracking-tight"
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
                    transition={{ duration: 0.1, delay: 0.3 + index * 0.12 }}
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
                    delay: 0.3 + 7 * 0.12,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ color: "#FAE452" }}
                >
                  .
                </motion.span>
              </h1>
              
              {/* Partner Logos - Reveal after typing */}
              <motion.div 
                className="mt-12 flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                <motion.p
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  Presented by
                </motion.p>
                {/* White container for logos */}
                <div 
                  className="px-8 py-5 rounded-2xl flex items-center gap-8"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src="/ats.png"
                      alt="Accent Techno Solutions"
                      width={140}
                      height={70}
                      className="object-contain"
                    />
                  </motion.div>
                  <div 
                    className="w-px h-12" 
                    style={{ background: "linear-gradient(180deg, transparent, rgba(46, 48, 147, 0.3), transparent)" }} 
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src="/sit.png"
                      alt="Suvidya Institute of Technology"
                      width={140}
                      height={70}
                      className="object-contain"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Subtle tap indicator */}
            <motion.div
              className="absolute bottom-12 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              {/* Chevron up animation */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{ opacity: 0.5 }}
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
                className="text-xs tracking-widest"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
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
            className="fixed inset-0 flex items-center justify-center overflow-hidden p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <WaveBackground />

            {/* Login Form */}
            <div className="relative z-10 w-full max-w-md">
              <LoginForm onStartSimulation={handleStartSimulation} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
