"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz, IndustryQuestion } from "@/lib/quiz-context";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#1a1d2e",
};

// Category display names and icons
const CATEGORY_INFO: Record<string, { name: string; icon: string }> = {
  business: { name: "Business Strategy", icon: "📊" },
  sustainability: { name: "Sustainability", icon: "🌱" },
  supply_chain: { name: "Supply Chain", icon: "🔗" },
  digital: { name: "Digital Transformation", icon: "💡" },
  compliance: { name: "Compliance", icon: "📋" },
  finance: { name: "Finance", icon: "💰" },
};

// Minimal executive background
function MinimalBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.indigo}20 50%, ${BRAND.dark} 100%)`,
        }}
      />
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Gradient accent */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-[0.08]"
        style={{
          background: `radial-gradient(ellipse at top right, ${BRAND.blue}, transparent 70%)`,
        }}
      />
    </div>
  );
}

export default function IndustryQuizPage() {
  const router = useRouter();
  const {
    questions,
    answers,
    currentQuestionIndex,
    setQuestions,
    answerQuestion,
    nextQuestion,
    calculateInsights,
  } = useQuiz();
  
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/industry-quiz");
        const data = await response.json();
        if (data.success && data.questions) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [setQuestions]);

  const currentQuestion: IndustryQuestion | undefined = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = selectedOption !== null;

  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (hasAnswered) return;
    
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    
    // Record answer
    if (currentQuestion) {
      answerQuestion({
        questionId: currentQuestion._id,
        category: currentQuestion.category,
        selectedOption: optionIndex,
        isCorrect: optionIndex === currentQuestion.correct,
      });
    }
  }, [hasAnswered, currentQuestion, answerQuestion]);

  const handleNext = useCallback(async () => {
    setIsTransitioning(true);
    
    if (isLastQuestion) {
      // Calculate insights and log results
      const insights = calculateInsights();
      
      // Build final answers array including current answer
      const finalAnswers = [...answers, {
        questionId: currentQuestion?._id,
        category: currentQuestion?.category,
        selectedOption,
        isCorrect: selectedOption === currentQuestion?.correct,
      }];
      
      // Calculate correct answers count
      const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = finalAnswers.length;
      const scoreOutOf10 = Math.round((correctAnswers / totalQuestions) * 10);
      
      // Log anonymized results to MongoDB
      try {
        await fetch("/api/industry-quiz/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            insights,
            answers: finalAnswers,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to log results:", error);
      }
      
      // Save quiz score to user record
      try {
        const sessionId = typeof window !== "undefined" 
          ? sessionStorage.getItem("genesisSessionId") 
          : null;
        
        if (sessionId) {
          await fetch("/api/user/quiz-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              score: scoreOutOf10,
              totalQuestions,
              correctAnswers,
              insights,
            }),
          });
        }
      } catch (error) {
        console.error("Failed to save quiz score to user:", error);
      }
      
      // Navigate to quiz complete page
      router.push("/quiz-complete");
    } else {
      nextQuestion();
      setSelectedOption(null);
      setShowExplanation(false);
      setIsTransitioning(false);
    }
  }, [isLastQuestion, calculateInsights, answers, currentQuestion, selectedOption, router, nextQuestion]);

  if (loading) {
    return (
      <div className="min-h-screen min-h-[568px] flex items-center justify-center" style={{ background: BRAND.dark }}>
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-10 h-10 rounded-full border-2"
            style={{ borderColor: `${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm" style={{ color: `${BRAND.white}60` }}>Loading assessment...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen min-h-[568px] flex items-center justify-center" style={{ background: BRAND.dark }}>
        <p style={{ color: BRAND.white }}>No questions available</p>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[currentQuestion.category] || { name: "General", icon: "📝" };

  return (
    <div className="min-h-screen min-h-[568px] flex flex-col relative overflow-hidden">
      <MinimalBackground />

      <div className="relative z-10 flex-1 flex flex-col p-3 xs:p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {/* Header */}
        <motion.header
          className="mb-4 xs:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div>
              <p className="text-[10px] xs:text-xs uppercase tracking-widest mb-1" style={{ color: `${BRAND.white}50` }}>
                Industry Literacy Assessment
              </p>
              <h1 className="text-lg xs:text-xl sm:text-2xl font-semibold" style={{ color: BRAND.white }}>
                Question {currentQuestionIndex + 1}
                <span style={{ color: `${BRAND.white}40` }}> / {questions.length}</span>
              </h1>
            </div>
            <div 
              className="px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-[10px] xs:text-xs font-medium"
              style={{ 
                background: `${BRAND.yellow}15`,
                color: BRAND.yellow,
                border: `1px solid ${BRAND.yellow}30`,
              }}
            >
              {categoryInfo.icon} {categoryInfo.name}
            </div>
          </div>
          
          {/* Progress bar */}
          <div 
            className="h-1 rounded-full overflow-hidden"
            style={{ background: `${BRAND.white}10` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: BRAND.yellow }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.header>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <motion.div
              className="p-4 xs:p-6 rounded-xl xs:rounded-2xl mb-4 xs:mb-6"
              style={{
                background: `${BRAND.white}05`,
                border: `1px solid ${BRAND.white}10`,
              }}
            >
              <p 
                className="text-base xs:text-lg sm:text-xl font-medium leading-relaxed"
                style={{ color: BRAND.white }}
              >
                {currentQuestion.question}
              </p>
            </motion.div>

            {/* Options */}
            <div className="space-y-2 xs:space-y-3 flex-1">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === currentQuestion.correct;
                const showCorrect = hasAnswered && isCorrect;
                const showIncorrect = hasAnswered && isSelected && !isCorrect;
                
                let bgColor = `${BRAND.white}05`;
                let borderColor = `${BRAND.white}10`;
                
                if (showCorrect) {
                  bgColor = "rgba(34, 197, 94, 0.15)";
                  borderColor = "#22C55E";
                } else if (showIncorrect) {
                  bgColor = "rgba(239, 68, 68, 0.15)";
                  borderColor = "#EF4444";
                } else if (isSelected) {
                  bgColor = `${BRAND.yellow}15`;
                  borderColor = BRAND.yellow;
                }

                return (
                  <motion.button
                    key={index}
                    className="w-full p-3 xs:p-4 rounded-lg xs:rounded-xl text-left transition-all"
                    style={{
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                    }}
                    onClick={() => handleOptionSelect(index)}
                    disabled={hasAnswered}
                    whileHover={!hasAnswered ? { scale: 1.01, borderColor: `${BRAND.white}30` } : {}}
                    whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                  >
                    <span className="flex items-center gap-2 xs:gap-3">
                      <span 
                        className="w-6 h-6 xs:w-8 xs:h-8 rounded-full flex items-center justify-center text-xs xs:text-sm font-medium flex-shrink-0"
                        style={{
                          background: isSelected || showCorrect ? (showCorrect ? "#22C55E" : showIncorrect ? "#EF4444" : BRAND.yellow) : `${BRAND.white}10`,
                          color: isSelected || showCorrect ? BRAND.dark : BRAND.white,
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span 
                        className="flex-1 text-sm xs:text-base leading-snug"
                        style={{ color: BRAND.white }}
                      >
                        {option}
                      </span>
                      {showCorrect && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" className="flex-shrink-0">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {showIncorrect && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" className="flex-shrink-0">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation Panel */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  className="mt-4 xs:mt-6 p-4 xs:p-5 rounded-xl"
                  style={{
                    background: `${BRAND.blue}10`,
                    border: `1px solid ${BRAND.blue}20`,
                  }}
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${BRAND.blue}30` }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BRAND.white} strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                      </svg>
                    </div>
                    <div>
                      <p 
                        className="text-xs uppercase tracking-wider mb-1 font-medium"
                        style={{ color: `${BRAND.white}60` }}
                      >
                        Insight
                      </p>
                      <p 
                        className="text-sm xs:text-base leading-relaxed"
                        style={{ color: `${BRAND.white}90` }}
                      >
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            <AnimatePresence>
              {hasAnswered && (
                <motion.div
                  className="mt-4 xs:mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.button
                    className="w-full py-3 xs:py-4 rounded-xl font-medium text-sm xs:text-base"
                    style={{
                      background: BRAND.yellow,
                      color: BRAND.dark,
                    }}
                    onClick={handleNext}
                    disabled={isTransitioning}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLastQuestion ? "View Your Insights →" : "Continue →"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
