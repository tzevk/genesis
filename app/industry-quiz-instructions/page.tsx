"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#1a1d2e",
};

// Minimal executive background
function MinimalBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(160deg, ${BRAND.dark} 0%, ${BRAND.indigo}15 50%, ${BRAND.dark} 100%)`,
        }}
      />
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Accent glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{
          background: `radial-gradient(circle, ${BRAND.yellow}, transparent 60%)`,
        }}
      />
    </div>
  );
}

// Instruction item component
function InstructionItem({ 
  number, 
  title, 
  description, 
  delay 
}: { 
  number: number; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex gap-3 xs:gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div 
        className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ 
          background: `${BRAND.yellow}15`,
          border: `1px solid ${BRAND.yellow}30`,
        }}
      >
        <span 
          className="text-sm xs:text-base font-semibold"
          style={{ color: BRAND.yellow }}
        >
          {number}
        </span>
      </div>
      <div className="flex-1 pt-0.5">
        <h3 
          className="text-sm xs:text-base font-medium mb-1"
          style={{ color: BRAND.white }}
        >
          {title}
        </h3>
        <p 
          className="text-xs xs:text-sm leading-relaxed"
          style={{ color: `${BRAND.white}60` }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function IndustryQuizInstructionsPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay for smooth entrance
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const instructions = [
    {
      title: "5 Industry Questions",
      description: "Answer questions covering business strategy, sustainability, digital transformation, and more.",
    },
    {
      title: "One Question at a Time",
      description: "Focus on each question individually. Take your time to read and understand before selecting.",
    },
    {
      title: "Learn as You Go",
      description: "After each answer, you'll see an explanation to deepen your understanding.",
    },
    {
      title: "Get Personalized Insights",
      description: "Receive a customized awareness profile and recommendations based on your responses.",
    },
  ];

  const handleStart = () => {
    router.push("/industry-quiz");
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen min-h-[568px] flex flex-col relative overflow-hidden">
      <MinimalBackground />

      <div className="relative z-10 flex-1 flex flex-col p-4 xs:p-6 max-w-lg mx-auto w-full">
        {/* Header */}
        <motion.header
          className="text-center pt-6 xs:pt-10 mb-6 xs:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ 
              background: `${BRAND.yellow}10`,
              border: `1px solid ${BRAND.yellow}20`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={BRAND.yellow}
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span 
              className="text-[10px] xs:text-xs font-medium uppercase tracking-wider"
              style={{ color: BRAND.yellow }}
            >
              Industry Literacy Assessment
            </span>
          </motion.div>

          <h1 
            className="text-xl xs:text-2xl sm:text-3xl font-semibold mb-2 xs:mb-3"
            style={{ color: BRAND.white }}
          >
            Before You Begin
          </h1>
          
          <p 
            className="text-sm xs:text-base leading-relaxed"
            style={{ color: `${BRAND.white}60` }}
          >
            A quick assessment to measure your industry awareness
          </p>
        </motion.header>

        {/* Instructions */}
        <motion.section
          className="flex-1 space-y-4 xs:space-y-5 mb-6 xs:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {instructions.map((instruction, i) => (
            <InstructionItem
              key={i}
              number={i + 1}
              title={instruction.title}
              description={instruction.description}
              delay={0.3 + i * 0.1}
            />
          ))}
        </motion.section>

        {/* Info Card */}
        <motion.div
          className="p-4 rounded-xl mb-6 xs:mb-8"
          style={{
            background: `${BRAND.white}03`,
            border: `1px solid ${BRAND.white}08`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${BRAND.blue}20` }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={BRAND.blue}
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <div>
              <p 
                className="text-xs xs:text-sm leading-relaxed"
                style={{ color: `${BRAND.white}70` }}
              >
                This assessment covers real-world industry topics. 
                There&apos;s no time limit—focus on learning!
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="w-full py-3 xs:py-4 rounded-xl font-medium text-sm xs:text-base"
            style={{
              background: BRAND.yellow,
              color: BRAND.dark,
            }}
            onClick={handleStart}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="flex items-center justify-center gap-2">
              Start Assessment
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-4 xs:mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p 
            className="text-[10px] xs:text-xs"
            style={{ color: `${BRAND.white}30` }}
          >
            Powered by GENESIS
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
