"use client";

/**
 * Live Leaderboard Page - For TV Display at Stall
 * Full-screen real-time leaderboard with auto-refresh
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
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

// Sector colors - using brand colors
const SECTOR_COLORS: Record<string, string> = {
  process: BRAND.blue,
  hvac: BRAND.blue,
  oilgas: BRAND.yellow,
  "oil & gas": BRAND.yellow,
  "Oil & Gas": BRAND.yellow,
  electrical: BRAND.yellow,
  mep: BRAND.blue,
};

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

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: BRAND.indigo,
      }}
    >
      {/* Header */}
      <header
        className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between"
        style={{
          background: `${BRAND.indigo}`,
          borderBottom: `3px solid ${BRAND.yellow}40`,
        }}
      >
        <div className="flex items-center gap-3 md:gap-6">
          <motion.div
            className="w-10 h-10 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: BRAND.yellow }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <svg className="w-6 h-6 md:w-10 md:h-10" viewBox="0 0 24 24" fill={BRAND.indigo}>
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </motion.div>
          <div>
            <h1
              className="text-xl md:text-4xl font-black tracking-tight"
              style={{ color: BRAND.white }}
            >
              GENESIS
            </h1>
            <p
              className="text-xs md:text-lg font-medium"
              style={{ color: BRAND.yellow }}
            >
              Live Leaderboard
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <motion.div
              className="w-2 h-2 md:w-3 md:h-3 rounded-full"
              style={{ background: BRAND.yellow }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs md:text-sm font-medium" style={{ color: BRAND.white }}>
              LIVE
            </span>
          </div>
          <p className="text-[10px] md:text-xs hidden sm:block" style={{ color: `${BRAND.white}60` }}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <p className="text-xs md:text-sm font-semibold mt-1" style={{ color: BRAND.yellow }}>
            {totalParticipants} Players
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-8 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <motion.div
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4"
              style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="h-full flex flex-col">
            {/* Desktop Table Header - Hidden on mobile */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 rounded-t-2xl"
              style={{ background: `${BRAND.blue}30` }}
            >
              <div className="col-span-1 text-center">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: `${BRAND.white}70` }}>
                  Rank
                </span>
              </div>
              <div className="col-span-5">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: `${BRAND.white}70` }}>
                  Player
                </span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: `${BRAND.white}70` }}>
                  Sector
                </span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: `${BRAND.white}70` }}>
                  Score
                </span>
              </div>
            </div>

            {/* Table Body */}
            <div
              className="flex-1 overflow-y-auto md:rounded-b-2xl rounded-2xl"
              style={{ background: `${BRAND.indigo}60` }}
            >
              <AnimatePresence mode="popLayout">
                {leaderboard.map((entry, index) => {
                  const isTopThree = entry.rank <= 3;
                  const sectorKey = entry.sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "") || "";
                  const sectorColor = SECTOR_COLORS[entry.sector] || SECTOR_COLORS[sectorKey] || BRAND.blue;
                  const sectorName = SECTOR_NAMES[entry.sector] || SECTOR_NAMES[sectorKey] || entry.sector || "Unknown";

                  return (
                    <motion.div
                      key={`${entry.phone}-${entry.rank}`}
                      className="border-b"
                      style={{
                        borderColor: `${BRAND.blue}15`,
                        background: isTopThree ? `${BRAND.yellow}08` : "transparent",
                      }}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      {/* Mobile Card Layout */}
                      <div className="md:hidden p-3 flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0">
                          {isTopThree ? (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ 
                                background: entry.rank === 1 ? BRAND.yellow : entry.rank === 2 ? `${BRAND.white}80` : `${BRAND.yellow}60`,
                                boxShadow: entry.rank === 1 ? `0 0 15px ${BRAND.yellow}50` : 'none',
                              }}
                            >
                              <span className="text-lg font-black" style={{ color: BRAND.indigo }}>
                                {entry.rank}
                              </span>
                            </div>
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: `${BRAND.blue}30` }}
                            >
                              <span className="text-sm font-bold" style={{ color: `${BRAND.white}70` }}>
                                {entry.rank}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-base font-bold truncate"
                            style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                          >
                            {entry.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{
                                background: `${sectorColor}20`,
                                color: sectorColor,
                              }}
                            >
                              {sectorName}
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          <motion.span
                            className="text-2xl font-black"
                            style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                            key={entry.score}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                          >
                            {typeof entry.score === 'number' ? entry.score.toFixed(1) : entry.score}
                          </motion.span>
                          <span className="text-xs ml-0.5" style={{ color: `${BRAND.white}40` }}>/10</span>
                        </div>
                      </div>

                      {/* Desktop Row Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center">
                        {/* Rank */}
                        <div className="col-span-1 text-center">
                          {isTopThree ? (
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                              style={{ 
                                background: entry.rank === 1 ? BRAND.yellow : entry.rank === 2 ? `${BRAND.white}80` : `${BRAND.yellow}60`,
                                boxShadow: entry.rank === 1 ? `0 0 20px ${BRAND.yellow}50` : 'none',
                              }}
                            >
                              <span 
                                className="text-xl font-black"
                                style={{ color: BRAND.indigo }}
                              >
                                {entry.rank}
                              </span>
                            </div>
                          ) : (
                            <span
                              className="text-2xl font-bold"
                              style={{ color: `${BRAND.white}60` }}
                            >
                              #{entry.rank}
                            </span>
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
                          <p
                            className="text-sm"
                            style={{ color: `${BRAND.white}40` }}
                          >
                            {entry.phone}
                          </p>
                        </div>

                        {/* Sector */}
                        <div className="col-span-3 text-center">
                          <span
                            className="px-4 py-2 rounded-full text-sm font-semibold inline-block"
                            style={{
                              background: `${sectorColor}20`,
                              color: sectorColor,
                              border: `1px solid ${sectorColor}40`,
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
                          <span
                            className="text-lg font-normal ml-1"
                            style={{ color: `${BRAND.white}40` }}
                          >
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
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div 
                className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl flex items-center justify-center"
                style={{ background: `${BRAND.yellow}20`, border: `2px solid ${BRAND.yellow}40` }}
              >
                <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 24 24" fill={BRAND.yellow}>
                  <path d="M21 6h-2V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3H3a1 1 0 0 0-1 1v4c0 3.31 2.69 6 6 6h.1a5 5 0 0 0 3.9 3.86V22h-3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-1.14A5 5 0 0 0 17.9 17h.1c3.31 0 6-2.69 6-6V7a1 1 0 0 0-1-1zM4 11V8h1v5.17c-1.16-.41-2-1.53-2-2.83zm16 0c0 1.3-.84 2.42-2 2.83V8h1v3z"/>
                </svg>
              </div>
              <p className="text-lg md:text-2xl font-bold" style={{ color: BRAND.white }}>
                Waiting for players...
              </p>
              <p className="text-sm md:text-lg mt-2" style={{ color: `${BRAND.white}50` }}>
                Be the first to compete!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="px-3 md:px-4 py-2 md:py-3 flex items-center justify-center"
        style={{
          background: `${BRAND.indigo}ee`,
          borderTop: `1px solid ${BRAND.blue}20`,
        }}
      >
        <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
          <span className="text-[10px] md:text-xs" style={{ color: `${BRAND.white}50` }}>
            Powered by
          </span>
          <span className="text-[10px] md:text-xs font-semibold" style={{ color: `${BRAND.white}80` }}>
            Accent Techno Solution Pvt Ltd.
          </span>
          <span className="hidden sm:inline text-xs" style={{ color: `${BRAND.white}30` }}>•</span>
          <span className="hidden sm:inline text-[10px] md:text-xs font-semibold" style={{ color: `${BRAND.white}80` }}>
            Suvidya Institute of Technology Pvt. Ltd.
          </span>
          <span className="text-[10px] md:text-xs" style={{ color: `${BRAND.white}30` }}>•</span>
          <span
            className="text-[10px] md:text-xs font-black tracking-wider"
            style={{ color: BRAND.yellow }}
          >
            GENESIS
          </span>
        </div>
      </footer>
    </div>
  );
}
