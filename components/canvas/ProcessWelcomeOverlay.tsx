"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = {
  skyBlue: "#3B82F6",
  lightBlue: "#60A5FA",
  deepBlue: "#1E3A8A",
  darkBlue: "#0F172A",
  cyan: "#06B6D4",
  vapor: "#93C5FD",
  liquid: "#2563EB",
  heat: "#F97316",
  white: "#F0F9FF",
};

interface ProcessWelcomeOverlayProps {
  onComplete: () => void;
  userName?: string;
}

export default function ProcessWelcomeOverlay({ onComplete, userName }: ProcessWelcomeOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing process...");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadingSteps = [
      { progress: 15, text: "Loading distillation unit..." },
      { progress: 30, text: "Configuring condenser..." },
      { progress: 45, text: "Initializing reflux system..." },
      { progress: 60, text: "Calibrating reboiler..." },
      { progress: 75, text: "Setting feed conditions..." },
      { progress: 90, text: "Starting simulation..." },
      { progress: 100, text: "Process ready!" },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < loadingSteps.length) {
        setProgress(loadingSteps[stepIndex].progress);
        setLoadingText(loadingSteps[stepIndex].text);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${COLORS.darkBlue} 0%, #0a1628 50%, #050d18 100%)` }}
    >
      {/* Animated vapor/bubble particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, ${i % 2 === 0 ? COLORS.vapor : COLORS.cyan}40 0%, transparent 70%)`,
              width: 8 + (i % 4) * 4,
              height: 8 + (i % 4) * 4,
              left: `${(i * 4) % 100}%`,
            }}
            initial={{ y: "100vh", opacity: 0.3 }}
            animate={{ y: "-10vh", opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 5 + (i % 4) * 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full mx-4 text-center">
        {/* Distillation Column Animation */}
        <motion.div 
          className="relative w-40 h-64 mx-auto mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Column Body */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 160">
            <defs>
              <linearGradient id="columnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={COLORS.deepBlue} />
                <stop offset="50%" stopColor={COLORS.skyBlue} stopOpacity="0.5" />
                <stop offset="100%" stopColor={COLORS.deepBlue} />
              </linearGradient>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={COLORS.vapor} />
                <stop offset="100%" stopColor={COLORS.liquid} />
              </linearGradient>
            </defs>
            
            {/* Main column */}
            <rect x="30" y="10" width="40" height="130" rx="6" fill="url(#columnGradient)" stroke={COLORS.skyBlue} strokeWidth="2" />
            
            {/* Column dome */}
            <ellipse cx="50" cy="14" rx="18" ry="6" fill={COLORS.deepBlue} stroke={COLORS.skyBlue} strokeWidth="2" />
            
            {/* Trays */}
            {[30, 50, 70, 90, 110].map((y, i) => (
              <g key={i}>
                <line x1="34" y1={y} x2="66" y2={y} stroke={COLORS.skyBlue} strokeWidth="1.5" opacity="0.6" />
              </g>
            ))}
            
            {/* Liquid at bottom */}
            <rect x="32" y="120" width="36" height="18" fill={COLORS.liquid} opacity="0.5" rx="2">
              <animate attributeName="height" values="15;20;15" dur="2s" repeatCount="indefinite" />
              <animate attributeName="y" values="123;118;123" dur="2s" repeatCount="indefinite" />
            </rect>
            
            {/* Rising vapor bubbles */}
            {[40, 50, 60].map((x, i) => (
              <circle key={i} cx={x} cy="80" r="3" fill={COLORS.vapor}>
                <animate attributeName="cy" values="115;30;115" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.8;0" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
            
            {/* Feed inlet */}
            <rect x="10" y="70" width="20" height="6" fill={COLORS.liquid} />
            <motion.rect 
              x="12" 
              y="71" 
              width="4" 
              height="4" 
              fill={COLORS.white}
              animate={{ x: [12, 28, 12] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            
            {/* Overhead vapor */}
            <rect x="68" y="18" width="20" height="6" fill={COLORS.vapor}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
            </rect>
            
            {/* Bottom product */}
            <rect x="68" y="130" width="20" height="6" fill={COLORS.liquid}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </rect>
          </svg>
          
          {/* Condenser (top right) */}
          <motion.div 
            className="absolute -top-2 right-0 w-12 h-12"
            animate={{ 
              boxShadow: [
                `0 0 10px ${COLORS.cyan}40`,
                `0 0 20px ${COLORS.cyan}60`,
                `0 0 10px ${COLORS.cyan}40`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill={COLORS.deepBlue} stroke={COLORS.cyan} strokeWidth="2" />
              <path d="M10 20 Q15 15 20 20 Q25 25 30 20" fill="none" stroke={COLORS.cyan} strokeWidth="2" />
            </svg>
          </motion.div>
          
          {/* Reboiler (bottom right) */}
          <motion.div 
            className="absolute -bottom-2 right-0 w-14 h-10"
            animate={{ 
              boxShadow: [
                `0 0 10px ${COLORS.heat}40`,
                `0 0 20px ${COLORS.heat}60`,
                `0 0 10px ${COLORS.heat}40`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg viewBox="0 0 50 35">
              <rect x="5" y="8" width="40" height="18" rx="9" fill={COLORS.deepBlue} stroke={COLORS.heat} strokeWidth="2" />
              <line x1="10" y1="20" x2="40" y2="20" stroke={COLORS.heat} strokeWidth="2">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite" />
              </line>
            </svg>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.white }}>
            Distillation Process
          </h1>
          {userName && (
            <p className="text-lg mb-1" style={{ color: COLORS.skyBlue }}>
              Welcome, {userName}!
            </p>
          )}
          <p className="text-sm mb-6" style={{ color: `${COLORS.white}60` }}>
            Crude oil separation simulation
          </p>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: `${COLORS.white}10` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${COLORS.skyBlue}, ${COLORS.cyan})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm" style={{ color: `${COLORS.white}70` }}>
            {loadingText}
          </p>
        </motion.div>

        {/* Process Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div 
            className="p-3 rounded-xl"
            style={{ background: `${COLORS.skyBlue}15`, border: `1px solid ${COLORS.skyBlue}30` }}
          >
            <div className="text-lg font-bold" style={{ color: COLORS.skyBlue }}>5</div>
            <div className="text-[10px]" style={{ color: `${COLORS.white}60` }}>Equipment</div>
          </div>
          <div 
            className="p-3 rounded-xl"
            style={{ background: `${COLORS.heat}15`, border: `1px solid ${COLORS.heat}30` }}
          >
            <div className="text-lg font-bold" style={{ color: COLORS.heat }}>200°C</div>
            <div className="text-[10px]" style={{ color: `${COLORS.white}60` }}>Target Temp</div>
          </div>
          <div 
            className="p-3 rounded-xl"
            style={{ background: `${COLORS.cyan}15`, border: `1px solid ${COLORS.cyan}30` }}
          >
            <div className="text-lg font-bold" style={{ color: COLORS.cyan }}>95%</div>
            <div className="text-[10px]" style={{ color: `${COLORS.white}60` }}>Purity Goal</div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isReady && (
            <motion.button
              onClick={onComplete}
              className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.skyBlue}, ${COLORS.cyan})`,
                color: COLORS.darkBlue,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <path d="M6 8h12M6 12h12M6 16h12" />
              </svg>
              Start Process
            </motion.button>
          )}
        </motion.div>

        {/* Skip hint */}
        {!isReady && (
          <motion.button
            onClick={onComplete}
            className="mt-4 text-xs underline"
            style={{ color: `${COLORS.white}40` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Skip loading
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
