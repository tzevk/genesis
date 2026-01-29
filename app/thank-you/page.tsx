"use client";

/**
 * Thank You Page - Displayed after simulation ends
 * Shows user's score and a leaderboard table
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo)
 * - #2A6BB5 (blue)
 * - #FAE452 (yellow)
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getUserDataAsync } from "@/lib/utils";

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

interface UserScore {
  name: string;
  bestScore: number;
  lastScore: number;
  sector: string;
}

// Pre-computed particle positions
const PARTICLES = [
  { width: 4, height: 4, left: 10, top: 20, duration: 3.5, delay: 0.2 },
  { width: 3, height: 3, left: 25, top: 45, duration: 4.0, delay: 0.5 },
  { width: 5, height: 5, left: 40, top: 15, duration: 3.2, delay: 0.8 },
  { width: 2, height: 2, left: 55, top: 70, duration: 4.5, delay: 1.0 },
  { width: 4, height: 4, left: 70, top: 35, duration: 3.8, delay: 0.3 },
  { width: 3, height: 3, left: 85, top: 60, duration: 4.2, delay: 0.7 },
  { width: 5, height: 5, left: 15, top: 80, duration: 3.3, delay: 1.2 },
  { width: 2, height: 2, left: 30, top: 10, duration: 4.8, delay: 0.1 },
];

// Sector display names
const SECTOR_NAMES: Record<string, string> = {
  process: "Process",
  hvac: "HVAC",
  oilgas: "Oil & Gas",
  electrical: "Electrical",
  mep: "MEP",
};

export default function ThankYouPage() {
  const router = useRouter();
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Prevent going back to previous page
  useEffect(() => {
    // Replace current history entry so user can't go back
    window.history.pushState(null, "", window.location.href);
    
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    
    window.addEventListener("popstate", preventBack);
    
    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user data
        const userData = await getUserDataAsync();
        if (userData) {
          setUserScore({
            name: userData.name,
            bestScore: userData.bestScore || 0,
            lastScore: userData.lastScore || 0,
            sector: userData.sector || "",
          });
        }

        // Fetch leaderboard
        const response = await fetch("/api/user/leaderboard?limit=10");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setLeaderboard(data.leaderboard);
            
            // Find user's rank
            if (userData?.phone) {
              const lastFour = userData.phone.slice(-4);
              const userEntry = data.leaderboard.find(
                (entry: LeaderboardEntry) => entry.phone.endsWith(lastFour)
              );
              if (userEntry) {
                setUserRank(userEntry.rank);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div
      className="min-h-screen min-h-[568px] flex flex-col items-center p-3 xs:p-4 sm:p-6 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${BRAND.indigo} 0%, #1a1d5c 50%, ${BRAND.indigo} 100%)`,
      }}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: particle.width,
              height: particle.height,
              background: `${BRAND.yellow}30`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto py-2 xs:py-4 flex flex-col h-full overflow-hidden">
        {/* Header Section - Compact */}
        <motion.div
          className="text-center mb-3 xs:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 xs:gap-4 mb-1 xs:mb-2">
            <motion.div
              className="w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${BRAND.yellow}20, ${BRAND.yellow}10)`,
                border: `2px solid ${BRAND.yellow}40`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <svg
                className="w-5 h-5 xs:w-6 xs:h-6"
                style={{ color: BRAND.yellow }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h1
              className="text-base xs:text-xl sm:text-2xl font-bold"
              style={{ color: BRAND.white }}
            >
            Thank you for building with GENESIS
          </h1>
          </div>
        </motion.div>

        {/* User Score Card - Compact inline */}
        {userScore && (
          <motion.div
            className="mb-3 xs:mb-4 p-3 xs:p-4 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}20, ${BRAND.indigo}40)`,
              border: `1px solid ${BRAND.blue}30`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 xs:gap-6 flex-wrap">
                <div>
                  <p className="text-[10px] xs:text-xs mb-0.5 xs:mb-1" style={{ color: `${BRAND.white}60` }}>
                    Your Score
                  </p>
                  <p className="text-xl xs:text-3xl font-bold" style={{ color: BRAND.yellow }}>
                    {userScore.bestScore}
                    <span className="text-[10px] xs:text-sm font-normal" style={{ color: `${BRAND.white}50` }}>
                      /100
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] xs:text-xs mb-0.5 xs:mb-1" style={{ color: `${BRAND.white}60` }}>
                    Sector
                  </p>
                  <p className="text-xs xs:text-base font-semibold" style={{ color: BRAND.white }}>
                    {SECTOR_NAMES[userScore.sector] || userScore.sector}
                  </p>
                </div>
                {userRank && (
                  <div>
                    <p className="text-[10px] xs:text-xs mb-0.5 xs:mb-1" style={{ color: `${BRAND.white}60` }}>
                      Rank
                    </p>
                    <p className="text-base xs:text-xl font-bold" style={{ color: BRAND.yellow }}>
                      #{userRank}
                    </p>
                </div>
              )}
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-3 xs:px-6 py-1.5 xs:py-2 rounded-lg font-semibold text-xs xs:text-sm transition-all duration-300 hover:scale-105 flex-shrink-0"
                style={{
                  background: BRAND.yellow,
                  color: BRAND.indigo,
                }}
              >
                Home
              </button>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Section - Full height */}
        <motion.div
          className="flex-1 rounded-xl xs:rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: `${BRAND.indigo}80`,
            border: `1px solid ${BRAND.blue}20`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="px-3 xs:px-6 py-2 xs:py-3 flex items-center justify-between flex-shrink-0"
            style={{
              background: `linear-gradient(90deg, ${BRAND.blue}30, ${BRAND.indigo}50)`,
              borderBottom: `1px solid ${BRAND.blue}20`,
            }}
          >
            <h2 className="text-sm xs:text-lg font-bold" style={{ color: BRAND.white }}>
              🏆 Leaderboard
            </h2>
            <span className="text-[10px] xs:text-xs px-2 xs:px-3 py-0.5 xs:py-1 rounded-full" style={{ background: `${BRAND.yellow}20`, color: BRAND.yellow }}>
              Top 10
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center flex-1 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 mx-auto rounded-full border-2"
                style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-sm" style={{ color: `${BRAND.white}50` }}>
                Loading leaderboard...
              </p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full">
                <thead className="sticky top-0" style={{ background: `${BRAND.indigo}` }}>
                  <tr style={{ background: `${BRAND.indigo}95` }}>
                    <th className="px-2 xs:px-4 py-1.5 xs:py-2 text-left text-[10px] xs:text-xs font-semibold uppercase tracking-wider" style={{ color: `${BRAND.white}60` }}>
                      Rank
                    </th>
                    <th className="px-2 xs:px-4 py-1.5 xs:py-2 text-left text-[10px] xs:text-xs font-semibold uppercase tracking-wider" style={{ color: `${BRAND.white}60` }}>
                      Name
                    </th>
                    <th className="px-2 xs:px-4 py-1.5 xs:py-2 text-left text-[10px] xs:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: `${BRAND.white}60` }}>
                      Sector
                    </th>
                    <th className="px-2 xs:px-4 py-1.5 xs:py-2 text-right text-[10px] xs:text-xs font-semibold uppercase tracking-wider" style={{ color: `${BRAND.white}60` }}>
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = userScore && entry.phone.endsWith(userScore.name.slice(-4));
                    const isTopThree = entry.rank <= 3;
                    const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : "";
                    
                    return (
                      <motion.tr
                        key={entry.rank}
                        className="border-b transition-colors"
                        style={{
                          borderColor: `${BRAND.blue}10`,
                          background: isCurrentUser ? `${BRAND.yellow}10` : "transparent",
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        whileHover={{ background: `${BRAND.blue}15` }}
                      >
                        <td className="px-2 xs:px-4 py-1.5 xs:py-2">
                          <span
                            className="font-bold text-sm xs:text-base"
                            style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                          >
                            {rankEmoji || `#${entry.rank}`}
                          </span>
                        </td>
                        <td className="px-2 xs:px-4 py-1.5 xs:py-2">
                          <div>
                            <p className="font-medium text-xs xs:text-sm" style={{ color: BRAND.white }}>
                              {entry.name}
                            </p>
                            <p className="text-[10px] xs:text-xs" style={{ color: `${BRAND.white}40` }}>
                              {entry.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 xs:px-4 py-1.5 xs:py-2 hidden sm:table-cell">
                          <span
                            className="text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full"
                            style={{
                              background: `${BRAND.blue}20`,
                              color: `${BRAND.white}80`,
                            }}
                          >
                            {SECTOR_NAMES[entry.sector] || entry.sector}
                          </span>
                        </td>
                        <td className="px-2 xs:px-4 py-1.5 xs:py-2 text-right">
                          <span
                            className="font-bold text-base xs:text-lg"
                            style={{ color: isTopThree ? BRAND.yellow : BRAND.white }}
                          >
                            {entry.score}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center flex-1 flex items-center justify-center">
              <p style={{ color: `${BRAND.white}50` }}>
                No scores yet. Be the first!
              </p>
            </div>
          )}
          
          {/* Powered by footer inside leaderboard card */}
          <div
            className="px-2 xs:px-4 py-2 xs:py-3 flex flex-wrap items-center justify-center gap-1 text-[9px] xs:text-xs flex-shrink-0"
            style={{
              borderTop: `1px solid ${BRAND.blue}20`,
              color: `${BRAND.white}40`,
            }}
          >
            <span>Powered by</span>
            <span style={{ color: `${BRAND.white}60` }}>Accent Techno Solution Pvt Ltd.</span>
            <span>•</span>
            <span style={{ color: `${BRAND.white}60` }}>Suvidya Institute of Technology Pvt. Ltd.</span>
          </div>
        </motion.div>

        {/* Take a Photo Button */}
        <motion.button
          className="w-full py-3 xs:py-4 rounded-xl font-medium text-sm xs:text-base flex items-center justify-center gap-2 mt-4"
          style={{
            background: BRAND.yellow,
            color: BRAND.indigo,
          }}
          onClick={() => router.push("/photobooth")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Take a Photo 📸
        </motion.button>
      </div>
    </div>
  );
}
