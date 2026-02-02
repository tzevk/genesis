"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuiz } from "@/lib/quiz-context";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#1a1d2e",
};

// Scholarship discount based on score (out of 10)
function getScholarshipDiscount(scoreOutOf10: number): { percentage: number; eligible: boolean } {
  if (scoreOutOf10 >= 9) return { percentage: 5, eligible: true };
  if (scoreOutOf10 >= 8) return { percentage: 3, eligible: true };
  if (scoreOutOf10 >= 7) return { percentage: 2, eligible: true };
  return { percentage: 0, eligible: false };
}

// Radar chart component using SVG
function RadarChart({ 
  data 
}: { 
  data: { label: string; value: number; color: string }[] 
}) {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.38;
  const levels = 5;
  
  // Calculate points for each data item
  const angleStep = (Math.PI * 2) / data.length;
  
  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };
  
  // Generate polygon points
  const polygonPoints = data
    .map((d, i) => {
      const point = getPoint(d.value, i);
      return `${point.x},${point.y}`;
    })
    .join(" ");
  
  // Generate grid levels
  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelRadius = (radius / levels) * (i + 1);
    const points = data
      .map((_, j) => {
        const angle = j * angleStep - Math.PI / 2;
        return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
      })
      .join(" ");
    return points;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {/* Background grid */}
      {gridLevels.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke={`${BRAND.white}10`}
          strokeWidth="1"
        />
      ))}
      
      {/* Axis lines */}
      {data.map((_, i) => {
        const endPoint = getPoint(100, i);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke={`${BRAND.white}10`}
            strokeWidth="1"
          />
        );
      })}
      
      {/* Data polygon */}
      <motion.polygon
        points={polygonPoints}
        fill={`${BRAND.yellow}20`}
        stroke={BRAND.yellow}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      
      {/* Data points */}
      {data.map((d, i) => {
        const point = getPoint(d.value, i);
        return (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={BRAND.yellow}
            stroke={BRAND.dark}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          />
        );
      })}
      
      {/* Labels */}
      {data.map((d, i) => {
        const labelPoint = getPoint(130, i);
        const textAnchor = labelPoint.x < center - 10 ? "end" : labelPoint.x > center + 10 ? "start" : "middle";
        
        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill={BRAND.white}
            fontSize="10"
            fontWeight="500"
            opacity="0.7"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// KPI Card component
function KPICard({ 
  title, 
  value, 
  description, 
  delay = 0 
}: { 
  title: string; 
  value: number; 
  description: string;
  delay?: number;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22C55E";
    if (score >= 50) return BRAND.yellow;
    return "#EF4444";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 50) return "Developing";
    return "Emerging";
  };

  return (
    <motion.div
      className="p-4 xs:p-5 rounded-xl"
      style={{
        background: `${BRAND.white}05`,
        border: `1px solid ${BRAND.white}08`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-xs xs:text-sm font-medium uppercase tracking-wider"
          style={{ color: `${BRAND.white}60` }}
        >
          {title}
        </h3>
        <span 
          className="px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium"
          style={{ 
            background: `${getScoreColor(value)}20`,
            color: getScoreColor(value),
          }}
        >
          {getScoreLabel(value)}
        </span>
      </div>
      
      <div className="flex items-end gap-2 mb-3">
        <span 
          className="text-3xl xs:text-4xl font-bold"
          style={{ color: getScoreColor(value) }}
        >
          {value}
        </span>
        <span 
          className="text-sm xs:text-base mb-1"
          style={{ color: `${BRAND.white}40` }}
        >
          / 100
        </span>
      </div>
      
      {/* Progress bar */}
      <div 
        className="h-1.5 rounded-full overflow-hidden mb-3"
        style={{ background: `${BRAND.white}10` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: getScoreColor(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        />
      </div>
      
      <p 
        className="text-xs xs:text-sm leading-relaxed"
        style={{ color: `${BRAND.white}50` }}
      >
        {description}
      </p>
    </motion.div>
  );
}

// Minimal executive background
function MinimalBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.indigo}15 50%, ${BRAND.dark} 100%)`,
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />
    </div>
  );
}

export default function InsightsPage() {
  const router = useRouter();
  const { insights, answers } = useQuiz();
  const mountedRef = React.useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    
    // If no insights after mount, redirect to quiz
    if (!insights) {
      router.replace("/industry-quiz");
    }
  }, [insights, router]);

  if (!insights) {
    return (
      <div className="min-h-screen min-h-[568px] flex items-center justify-center" style={{ background: BRAND.dark }}>
        <motion.div
          className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const radarData = [
    { label: "Strategic", value: insights.strategicAwareness, color: BRAND.yellow },
    { label: "Sustainability", value: insights.sustainabilityAwareness, color: BRAND.yellow },
    { label: "Digital", value: insights.digitalAwareness, color: BRAND.yellow },
  ];

  const kpiDescriptions = {
    strategic: "Business acumen and financial understanding for strategic decision-making",
    sustainability: "Environmental awareness and regulatory compliance knowledge",
    digital: "Digital transformation readiness and technology adoption mindset",
  };

  return (
    <div className="min-h-screen min-h-[568px] flex flex-col relative overflow-hidden">
      <MinimalBackground />

      <div className="relative z-10 flex-1 flex flex-col p-3 xs:p-4 sm:p-6 max-w-3xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <motion.header
          className="text-center mb-6 xs:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p 
            className="text-[10px] xs:text-xs uppercase tracking-widest mb-2"
            style={{ color: `${BRAND.white}50` }}
          >
            Assessment Complete
          </p>
          <h1 
            className="text-xl xs:text-2xl sm:text-3xl font-semibold mb-2"
            style={{ color: BRAND.white }}
          >
            Your Industry Insights
          </h1>
          <p 
            className="text-sm xs:text-base"
            style={{ color: `${BRAND.white}50` }}
          >
            A consulting-style analysis of your industry awareness
          </p>
        </motion.header>

        {/* Radar Chart Section */}
        <motion.section
          className="mb-6 xs:mb-8 p-4 xs:p-6 rounded-xl xs:rounded-2xl"
          style={{
            background: `${BRAND.white}03`,
            border: `1px solid ${BRAND.white}08`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 
            className="text-sm xs:text-base font-medium mb-4 text-center"
            style={{ color: `${BRAND.white}70` }}
          >
            Awareness Profile
          </h2>
          <RadarChart data={radarData} />
          
          {/* Legend */}
          <div className="flex justify-center gap-4 xs:gap-6 mt-4">
            {radarData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: BRAND.yellow }}
                />
                <span 
                  className="text-[10px] xs:text-xs"
                  style={{ color: `${BRAND.white}60` }}
                >
                  {d.label}: {d.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4 mb-6 xs:mb-8">
          <KPICard
            title="Strategic Awareness"
            value={insights.strategicAwareness}
            description={kpiDescriptions.strategic}
            delay={0.3}
          />
          <KPICard
            title="Sustainability Awareness"
            value={insights.sustainabilityAwareness}
            description={kpiDescriptions.sustainability}
            delay={0.4}
          />
          <KPICard
            title="Digital Awareness"
            value={insights.digitalAwareness}
            description={kpiDescriptions.digital}
            delay={0.5}
          />
        </section>

        {/* Recommendations */}
        <motion.section
          className="mb-6 xs:mb-8 p-4 xs:p-6 rounded-xl xs:rounded-2xl"
          style={{
            background: `${BRAND.white}03`,
            border: `1px solid ${BRAND.white}08`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 
            className="text-sm xs:text-base font-medium mb-4 flex items-center gap-2"
            style={{ color: `${BRAND.white}70` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BRAND.yellow} strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Personalized Recommendations
          </h2>
          
          <div className="space-y-3">
            {insights.recommendations.slice(0, 3).map((rec, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: `${BRAND.white}03` }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <span 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium"
                  style={{ background: `${BRAND.yellow}20`, color: BRAND.yellow }}
                >
                  {i + 1}
                </span>
                <p 
                  className="text-xs xs:text-sm leading-relaxed"
                  style={{ color: `${BRAND.white}80` }}
                >
                  {rec}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Summary Stats */}
        <motion.div
          className="flex items-center justify-center gap-4 xs:gap-6 mb-4 xs:mb-6 py-3 xs:py-4"
          style={{ borderTop: `1px solid ${BRAND.white}08` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="text-center">
            <p 
              className="text-xl xs:text-2xl font-bold"
              style={{ color: BRAND.yellow }}
            >
              {answers.length}
            </p>
            <p 
              className="text-[9px] xs:text-[10px] uppercase tracking-wider"
              style={{ color: `${BRAND.white}50` }}
            >
              Questions
            </p>
          </div>
          <div 
            className="w-px h-6 xs:h-8"
            style={{ background: `${BRAND.white}15` }}
          />
          <div className="text-center">
            <p 
              className="text-xl xs:text-2xl font-bold"
              style={{ color: BRAND.yellow }}
            >
              {answers.filter(a => a.isCorrect).length}
            </p>
            <p 
              className="text-[9px] xs:text-[10px] uppercase tracking-wider"
              style={{ color: `${BRAND.white}50` }}
            >
              Correct
            </p>
          </div>
          <div 
            className="w-px h-6 xs:h-8"
            style={{ background: `${BRAND.white}15` }}
          />
          <div className="text-center">
            <p 
              className="text-xl xs:text-2xl font-bold"
              style={{ color: BRAND.yellow }}
            >
              {Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 10)}
              <span className="text-sm xs:text-base" style={{ color: `${BRAND.white}50` }}>/10</span>
            </p>
            <p 
              className="text-[9px] xs:text-[10px] uppercase tracking-wider"
              style={{ color: `${BRAND.white}50` }}
            >
              Score
            </p>
          </div>
        </motion.div>

        {/* Scholarship Award Section */}
        {(() => {
          const scoreOutOf10 = Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 10);
          const scholarship = getScholarshipDiscount(scoreOutOf10);
          return scholarship.eligible ? (
            <motion.section
              className="mb-4 xs:mb-6 p-4 xs:p-5 rounded-xl text-center"
              style={{
                background: `linear-gradient(135deg, ${BRAND.yellow}15, ${BRAND.yellow}05)`,
                border: `2px solid ${BRAND.yellow}40`,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.95, type: "spring" }}
            >
              <motion.div
                className="text-3xl xs:text-4xl mb-2"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                🎓
              </motion.div>
              <h3 
                className="text-base xs:text-lg font-bold mb-1"
                style={{ color: BRAND.yellow }}
              >
                Scholarship Earned!
              </h3>
              <p 
                className="text-xl xs:text-2xl font-bold mb-1"
                style={{ color: BRAND.white }}
              >
                {scholarship.percentage}% Discount
              </p>
              <p 
                className="text-xs xs:text-sm"
                style={{ color: `${BRAND.white}70` }}
              >
                at <span style={{ color: BRAND.yellow }}>Suvidya Institute of Technology</span>
              </p>
            </motion.section>
          ) : null;
        })()}

      </div>
    </div>
  );
}
