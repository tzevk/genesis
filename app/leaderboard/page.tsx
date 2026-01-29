"use client";

/**
 * Live Leaderboard Page - For TV Display at Stall
 * Full-screen real-time leaderboard with auto-refresh
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo) - for lines/underlines
 * - #2A6BB5 (blue) - primary background
 * - #FAE452 (yellow) - accents
 * - #FFFFFF (white) - text
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
} as const;

interface LeaderboardEntry {
  rank: number;
  name: string;
  phone: string;
  score: number;
  sector: string;
  attempts: number;
  slots?: number;
  timeLeft?: number;
}

// Sector display names
const SECTOR_NAMES: Record<string, string> = {
  process: "Process",
  hvac: "HVAC",
  oilgas: "Oil & Gas",
  "oil & gas": "Oil & Gas",
  "Oil & Gas": "Oil & Gas",
  electrical: "Electrical",
  mep: "MEP",
};

// Animated Background Component (same as login page)
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: BRAND.blue }}
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
        style={{ top: "10%", right: "5%", width: "150px", height: "150px" }}
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
        style={{ bottom: "15%", left: "3%", width: "100px", height: "100px" }}
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

// Trophy Icon Component
function TrophyIcon({ size = 24, color = BRAND.yellow }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

// Medal Component for Top 3
function RankMedal({ rank }: { rank: number }) {
  const colors = {
    1: { bg: BRAND.yellow, text: BRAND.indigo, glow: `0 0 30px ${BRAND.yellow}60` },
    2: { bg: BRAND.white, text: BRAND.indigo, glow: `0 0 20px ${BRAND.white}40` },
    3: { bg: `${BRAND.yellow}90`, text: BRAND.indigo, glow: `0 0 15px ${BRAND.yellow}30` },
  };
  
  const style = colors[rank as keyof typeof colors];
  
  return (
    <motion.div 
      className="w-10 h-10 xs:w-14 xs:h-14 rounded-full flex items-center justify-center relative"
      style={{ 
        background: style.bg,
        boxShadow: style.glow,
      }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
    >
      <span className="text-lg xs:text-2xl font-black" style={{ color: style.text }}>
        {rank}
      </span>
      {rank === 1 && (
        <motion.div 
          className="absolute -top-1 -right-1"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <TrophyIcon size={18} />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LiveLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [totalParticipants, setTotalParticipants] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/user/leaderboard?limit=20");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
          setTotalParticipants(data.total);
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen min-h-[568px] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-2 xs:px-4 md:px-8 py-2 xs:py-4 md:py-6">
          <div 
            className="max-w-6xl mx-auto flex items-center justify-between p-2 xs:p-4 md:p-6 rounded-xl xs:rounded-2xl"
            style={{ 
              background: `${BRAND.white}10`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${BRAND.white}20`,
            }}
          >
            <div className="flex items-center gap-2 xs:gap-3 md:gap-5">
              <motion.div
                className="w-10 h-10 xs:w-12 xs:h-12 md:w-16 md:h-16 rounded-lg xs:rounded-xl flex items-center justify-center"
                style={{ background: BRAND.yellow }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <TrophyIcon size={24} color={BRAND.indigo} />
              </motion.div>
              <div>
                <h1 className="text-lg xs:text-2xl md:text-4xl font-black tracking-tight" style={{ color: BRAND.white }}>
                  LEADERBOARD
                </h1>
                <div className="flex items-center gap-1.5 xs:gap-2 mt-0.5 xs:mt-1">
                  <div 
                    className="h-0.5 w-10 xs:w-16 md:w-24 rounded-full"
                    style={{ background: BRAND.indigo }}
                  />
                  <span className="text-[10px] xs:text-xs md:text-sm font-medium" style={{ color: BRAND.yellow }}>
                    GENESIS 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 xs:gap-2 justify-end mb-1 xs:mb-2">
                <motion.div
                  className="w-1.5 h-1.5 xs:w-2 xs:h-2 md:w-3 md:h-3 rounded-full"
                  style={{ background: "#22C55E" }}
                  animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] xs:text-xs md:text-sm font-bold tracking-wider" style={{ color: BRAND.white }}>
                  LIVE
                </span>
              </div>
              <p className="text-[9px] xs:text-[10px] md:text-xs hidden sm:block" style={{ color: `${BRAND.white}60` }}>
                {lastUpdated.toLocaleTimeString()}
              </p>
              <div 
                className="inline-block mt-1 xs:mt-2 px-2 xs:px-3 py-0.5 xs:py-1 rounded-full"
                style={{ background: `${BRAND.yellow}20`, border: `1px solid ${BRAND.yellow}40` }}
              >
                <span className="text-xs xs:text-sm md:text-base font-bold" style={{ color: BRAND.yellow }}>
                  {totalParticipants} Players
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-2 xs:px-4 md:px-8 pb-2 xs:pb-4 md:pb-8 overflow-hidden">
          <div 
            className="max-w-6xl mx-auto h-full rounded-xl xs:rounded-2xl overflow-hidden"
            style={{ 
              background: `${BRAND.white}08`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${BRAND.white}15`,
            }}
          >
            {loading ? (
              <div className="h-full flex items-center justify-center py-20">
                <motion.div
                  className="w-16 h-16 rounded-full border-4"
                  style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* Table Header - Desktop */}
                <div
                  className="hidden md:grid grid-cols-12 gap-4 px-6 py-4"
                  style={{ 
                    background: `${BRAND.indigo}30`,
                    borderBottom: `2px solid ${BRAND.indigo}`,
                  }}
                >
                  <div className="col-span-1 text-center">
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.white }}>
                      Rank
                    </span>
                  </div>
                  <div className="col-span-5">
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.white }}>
                      Player
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.white }}>
                      Sector
                    </span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.white }}>
                      Score
                    </span>
                  </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {leaderboard.map((entry, index) => {
                      const isTopThree = entry.rank <= 3;
                      const sectorKey = entry.sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "") || "";
                      const sectorName = SECTOR_NAMES[entry.sector] || SECTOR_NAMES[sectorKey] || entry.sector || "Unknown";

                      return (
                        <motion.div
                          key={`${entry.phone}-${entry.rank}`}
                          style={{
                            borderBottom: `1px solid ${BRAND.indigo}20`,
                            background: isTopThree ? `${BRAND.yellow}08` : "transparent",
                          }}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ background: `${BRAND.white}05` }}
                          layout
                        >
                          {/* Mobile Card Layout */}
                          <div className="md:hidden p-2 xs:p-4 flex items-center gap-2 xs:gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0">
                              {isTopThree ? (
                                <RankMedal rank={entry.rank} />
                              ) : (
                                <div 
                                  className="w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center"
                                  style={{ background: `${BRAND.white}10`, border: `1px solid ${BRAND.white}20` }}
                                >
                                  <span className="text-sm xs:text-lg font-bold" style={{ color: BRAND.white }}>
                                    {entry.rank}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm xs:text-base font-bold truncate"
                                style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                              >
                                {entry.name}
                              </p>
                              <span
                                className="inline-block mt-0.5 xs:mt-1 px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-semibold"
                                style={{
                                  background: `${BRAND.yellow}15`,
                                  color: BRAND.yellow,
                                  border: `1px solid ${BRAND.yellow}30`,
                                }}
                              >
                                {sectorName}
                              </span>
                            </div>

                            {/* Score */}
                            <div className="text-right flex-shrink-0">
                              <motion.span
                                className="text-2xl xs:text-3xl font-black"
                                style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                                key={entry.score}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                              >
                                {typeof entry.score === 'number' ? entry.score.toFixed(1) : entry.score}
                              </motion.span>
                              <span className="text-xs xs:text-sm ml-0.5" style={{ color: `${BRAND.white}40` }}>/10</span>
                            </div>
                          </div>

                          {/* Desktop Row Layout */}
                          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center">
                            {/* Rank */}
                            <div className="col-span-1 flex justify-center">
                              {isTopThree ? (
                                <RankMedal rank={entry.rank} />
                              ) : (
                                <div 
                                  className="w-12 h-12 rounded-full flex items-center justify-center"
                                  style={{ background: `${BRAND.white}10`, border: `1px solid ${BRAND.white}15` }}
                                >
                                  <span className="text-xl font-bold" style={{ color: `${BRAND.white}70` }}>
                                    {entry.rank}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Player Info */}
                            <div className="col-span-5">
                              <p
                                className="text-xl font-bold truncate"
                                style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                              >
                                {entry.name}
                              </p>
                              <p className="text-sm mt-0.5" style={{ color: `${BRAND.white}40` }}>
                                {entry.phone}
                              </p>
                            </div>

                            {/* Sector */}
                            <div className="col-span-3 text-center">
                              <span
                                className="px-4 py-2 rounded-full text-sm font-semibold inline-block"
                                style={{
                                  background: `${BRAND.yellow}15`,
                                  color: BRAND.yellow,
                                  border: `1px solid ${BRAND.yellow}30`,
                                }}
                              >
                                {sectorName}
                              </span>
                            </div>

                            {/* Score */}
                            <div className="col-span-3 text-right">
                              <motion.span
                                className="text-4xl font-black"
                                style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                                key={entry.score}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                              >
                                {typeof entry.score === 'number' ? entry.score.toFixed(1) : entry.score}
                              </motion.span>
                              <span className="text-lg font-normal ml-1" style={{ color: `${BRAND.white}40` }}>
                                /10
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-20">
                <div className="text-center px-4">
                  <motion.div 
                    className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{ background: `${BRAND.yellow}15`, border: `2px solid ${BRAND.yellow}30` }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrophyIcon size={48} />
                  </motion.div>
                  <p className="text-xl md:text-3xl font-bold" style={{ color: BRAND.white }}>
                    Waiting for players...
                  </p>
                  <p className="text-sm md:text-lg mt-3" style={{ color: `${BRAND.white}50` }}>
                    Be the first to compete!
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-2 xs:px-4 md:px-8 py-2 xs:py-3 md:py-4">
          <div 
            className="max-w-6xl mx-auto flex items-center justify-center py-2 xs:py-3 px-2 xs:px-4 rounded-lg xs:rounded-xl"
            style={{ 
              background: `${BRAND.white}08`,
              backdropFilter: "blur(10px)",
              borderTop: `2px solid ${BRAND.indigo}`,
            }}
          >
            <div className="flex items-center gap-1.5 xs:gap-2 md:gap-3 flex-wrap justify-center">
              <span className="text-[9px] xs:text-[10px] md:text-xs" style={{ color: `${BRAND.white}50` }}>
                Powered by
              </span>
              <span className="text-[9px] xs:text-[10px] md:text-xs font-semibold" style={{ color: BRAND.white }}>
                Accent Techno Solution Pvt Ltd.
              </span>
              <span className="hidden sm:inline text-[10px] xs:text-xs" style={{ color: `${BRAND.white}30` }}>•</span>
              <span className="hidden sm:inline text-[9px] xs:text-[10px] md:text-xs font-semibold" style={{ color: BRAND.white }}>
                Suvidya Institute of Technology Pvt. Ltd.
              </span>
              <span className="text-[9px] xs:text-[10px] md:text-xs" style={{ color: `${BRAND.white}30` }}>•</span>
              <span
                className="text-[9px] xs:text-[10px] md:text-xs font-black tracking-wider"
                style={{ color: BRAND.yellow }}
              >
                GENESIS
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
