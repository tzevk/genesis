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
}

// Sector display names
const SECTOR_NAMES: Record<string, string> = {
  process: "Process",
  hvac: "HVAC",
  oilgas: "Oil & Gas",
  electrical: "Electrical",
  mep: "MEP",
};

// Sector colors for visual distinction
const SECTOR_COLORS: Record<string, string> = {
  process: "#10B981",
  hvac: "#3B82F6",
  oilgas: "#F59E0B",
  electrical: "#EF4444",
  mep: "#8B5CF6",
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
        background: `linear-gradient(135deg, ${BRAND.indigo} 0%, #0f1035 50%, ${BRAND.indigo} 100%)`,
      }}
    >
      {/* Header */}
      <header
        className="px-8 py-6 flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${BRAND.indigo}ee, ${BRAND.blue}40)`,
          borderBottom: `2px solid ${BRAND.yellow}30`,
        }}
      >
        <div className="flex items-center gap-6">
          <motion.div
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🏆
          </motion.div>
          <div>
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ color: BRAND.white }}
            >
              GENESIS
            </h1>
            <p
              className="text-lg font-medium"
              style={{ color: BRAND.yellow }}
            >
              Live Leaderboard
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: "#22C55E" }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-medium" style={{ color: BRAND.white }}>
              LIVE
            </span>
          </div>
          <p className="text-xs" style={{ color: `${BRAND.white}60` }}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <p className="text-sm font-semibold mt-1" style={{ color: BRAND.yellow }}>
            {totalParticipants} Participants
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full border-4"
              style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="h-full flex flex-col">
            {/* Table Header */}
            <div
              className="grid grid-cols-12 gap-4 px-6 py-4 rounded-t-2xl"
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
              className="flex-1 overflow-y-auto rounded-b-2xl"
              style={{ background: `${BRAND.indigo}60` }}
            >
              <AnimatePresence mode="popLayout">
                {leaderboard.map((entry, index) => {
                  const isTopThree = entry.rank <= 3;
                  const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;
                  const sectorColor = SECTOR_COLORS[entry.sector] || BRAND.blue;

                  return (
                    <motion.div
                      key={`${entry.phone}-${entry.rank}`}
                      className="grid grid-cols-12 gap-4 px-6 py-5 border-b items-center"
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
                      {/* Rank */}
                      <div className="col-span-1 text-center">
                        {rankEmoji ? (
                          <span className="text-4xl">{rankEmoji}</span>
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
                          {SECTOR_NAMES[entry.sector] || entry.sector}
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
                          {entry.score}
                        </motion.span>
                        <span
                          className="text-lg font-normal ml-1"
                          style={{ color: `${BRAND.white}40` }}
                        >
                          pts
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4">🎮</p>
              <p className="text-2xl font-bold" style={{ color: BRAND.white }}>
                Waiting for players...
              </p>
              <p className="text-lg mt-2" style={{ color: `${BRAND.white}50` }}>
                Be the first to compete!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="px-4 py-3 flex items-center justify-center"
        style={{
          background: `${BRAND.indigo}ee`,
          borderTop: `1px solid ${BRAND.blue}20`,
        }}
      >
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs" style={{ color: `${BRAND.white}50` }}>
            Powered by
          </span>
          <span className="text-xs font-semibold" style={{ color: `${BRAND.white}80` }}>
            Accent Techno Solution Pvt Ltd.
          </span>
          <span className="text-xs" style={{ color: `${BRAND.white}30` }}>•</span>
          <span className="text-xs font-semibold" style={{ color: `${BRAND.white}80` }}>
            Suvidya Institute of Technology Pvt. Ltd.
          </span>
          <span className="text-xs" style={{ color: `${BRAND.white}30` }}>•</span>
          <span
            className="text-xs font-black tracking-wider"
            style={{ color: BRAND.yellow }}
          >
            GENESIS
          </span>
        </div>
      </footer>
    </div>
  );
}
