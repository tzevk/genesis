"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SECTORS } from "@/lib/constants";
import { getUserDataAsync, updateUserSector } from "@/lib/utils";

// Background component matching splash/login screens
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

type PagePhase = "intro" | "selection";

export default function SectorWheelPage() {
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Intro phase state
  const [phase, setPhase] = useState<PagePhase>("intro");
  const [displayText, setDisplayText] = useState("");
  const [showChoice, setShowChoice] = useState(false);
  const [showSectors, setShowSectors] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const typingText = "Every engineer begins with a";

  useEffect(() => {
    const loadUserData = async () => {
      // Fetch user data from MongoDB session
      const userData = await getUserDataAsync();
      if (!userData) {
        router.push("/");
        return;
      }
    };
    
    loadUserData();
  }, [router]);

  // Typing effect for intro
  useEffect(() => {
    if (phase !== "intro") return;

    const startDelay = setTimeout(() => {
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < typingText.length) {
          setDisplayText(typingText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // After typing complete, fade in "choice"
          setTimeout(() => {
            setShowChoice(true);
            // Show sectors after choice
            setTimeout(() => {
              setShowSectors(true);
              // Show subtitle after sectors
              setTimeout(() => {
                setShowSubtitle(true);
                // Show continue after subtitle
                setTimeout(() => {
                  setShowContinue(true);
                }, 1000);
              }, 1200);
            }, 1000);
          }, 300);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }, 500);

    return () => clearTimeout(startDelay);
  }, [phase]);

  // Transition to selection phase
  const handleContinue = () => {
    setPhase("selection");
  };

  const handleSectorSelect = (sectorName: string) => {
    setSelectedSector(sectorName);
  };

  const handleConfirmSelection = useCallback(async () => {
    if (!selectedSector || isSubmitting) return;
    
    setIsSubmitting(true);
    await updateUserSector(selectedSector);
    router.push("/canvas");
  }, [selectedSector, isSubmitting, router]);

  // Get sector icon component
  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case "process":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
        );
      case "hvac":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <path d="M12 3v18M3 12h18M7 7l10 10M17 7L7 17" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" strokeDasharray="4 2"/>
          </svg>
        );
      case "oilgas":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <path d="M12 2L8 10h8l-4-8z"/>
            <path d="M8 10v8a4 4 0 0 0 8 0v-8" strokeLinecap="round"/>
            <path d="M10 14h4M10 17h4" strokeLinecap="round"/>
          </svg>
        );
      case "electrical":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "mep":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 3v18M15 9v12" strokeLinecap="round"/>
            <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {/* INTRO PHASE - Statement */}
      {phase === "intro" && (
        <motion.div
          key="intro"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer"
          onClick={showContinue ? handleContinue : undefined}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <WaveBackground />

          {/* Statement text */}
          <motion.div
            className="relative z-10 text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className="text-2xl md:text-4xl tracking-tight"
              style={{ 
                color: "#ffffff",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
              }}
            >
              {displayText}
              {!showChoice && displayText.length > 0 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ color: "#FAE452" }}
                >
                  |
                </motion.span>
              )}
              {showChoice && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  {" "}<span style={{ color: "#FAE452", fontWeight: 600 }}>choice</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    style={{ color: "#FAE452" }}
                  >.</motion.span>
                </motion.span>
              )}
            </h1>

            {/* Sectors list */}
            {showSectors && (
              <motion.p
                className="mt-8 text-lg md:text-xl font-light tracking-wide"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <span style={{ color: "#FAE452" }}>Process</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>Electrical</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>HVAC</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>Oil & Gas</span>
                <span style={{ color: "rgba(255, 255, 255, 0.3)" }}> · </span>
                <span style={{ color: "#FAE452" }}>MEP</span>
              </motion.p>
            )}

            {/* Subtitle */}
            {showSubtitle && (
              <motion.p
                className="mt-4 text-sm md:text-base font-light"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
              >
                Each path shapes the world differently.
              </motion.p>
            )}

            {/* Tap to continue */}
            {showContinue && (
              <motion.div
                className="mt-12 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
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
                      stroke="#FAE452" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <motion.p
                  className="text-xs tracking-widest"
                  style={{ color: "rgba(250, 228, 82, 0.5)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Tap anywhere to continue
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* SECTOR SELECTION PHASE */}
      {phase === "selection" && (
        <motion.div
          key="selection"
          className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <WaveBackground />

          <div className="relative z-10 text-center w-full max-w-2xl px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 
                className="text-2xl md:text-3xl mb-2 tracking-tight" 
                style={{ 
                  color: "#ffffff",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                }}
              >
                Choose your <span style={{ color: '#FAE452' }}>sector</span>
              </h1>
              <p className="text-sm font-light tracking-wide mb-8" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Select the engineering domain you want to explore
              </p>
            </motion.div>

            {/* Sector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {SECTORS.map((sector, index) => (
                <motion.button
                  key={sector.name}
                  onClick={() => handleSectorSelect(sector.name)}
                  className="relative p-6 rounded-2xl transition-all duration-300 group"
                  style={{
                    background: selectedSector === sector.name 
                      ? "rgba(250, 228, 82, 0.15)" 
                      : "rgba(255, 255, 255, 0.05)",
                    border: selectedSector === sector.name 
                      ? "2px solid #FAE452" 
                      : "2px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    background: "rgba(250, 228, 82, 0.1)",
                    borderColor: "rgba(250, 228, 82, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Selection indicator */}
                  {selectedSector === sector.name && (
                    <motion.div
                      className="absolute top-3 right-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#FAE452"/>
                        <path d="M6 10l3 3 5-6" stroke="#2E3093" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div 
                    className="mb-3 flex justify-center transition-colors duration-300"
                    style={{ 
                      color: selectedSector === sector.name ? "#FAE452" : "rgba(255, 255, 255, 0.7)" 
                    }}
                  >
                    {getSectorIcon(sector.icon)}
                  </div>

                  {/* Sector name */}
                  <h3 
                    className="text-lg font-semibold mb-1 transition-colors duration-300"
                    style={{ 
                      color: selectedSector === sector.name ? "#FAE452" : "#ffffff" 
                    }}
                  >
                    {sector.name}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-xs font-light leading-relaxed transition-colors duration-300"
                    style={{ 
                      color: selectedSector === sector.name 
                        ? "rgba(250, 228, 82, 0.8)" 
                        : "rgba(255, 255, 255, 0.5)" 
                    }}
                  >
                    {sector.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedSector ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handleConfirmSelection}
                disabled={!selectedSector || isSubmitting}
                className="px-10 py-4 rounded-full text-sm tracking-wider font-medium transition-all duration-300 disabled:cursor-not-allowed"
                style={{
                  background: selectedSector ? "#FAE452" : "rgba(250, 228, 82, 0.3)",
                  color: "#2E3093",
                  boxShadow: selectedSector ? "0 8px 32px rgba(250, 228, 82, 0.4)" : "none",
                }}
                whileHover={selectedSector ? { 
                  scale: 1.05,
                  boxShadow: "0 12px 40px rgba(250, 228, 82, 0.5)",
                } : {}}
                whileTap={selectedSector ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? "LOADING..." : "CONTINUE"}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
