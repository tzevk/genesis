"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Industry quiz question type
export interface IndustryQuestion {
  _id: string;
  question: string;
  options: string[];
  correct: number;
  category: "business" | "sustainability" | "supply_chain" | "digital" | "compliance" | "finance";
  explanation: string;
}

// User answer with category tracking
export interface QuizAnswer {
  questionId: string;
  category: string;
  selectedOption: number;
  isCorrect: boolean;
}

// Insights calculated from quiz performance
export interface QuizInsights {
  strategicAwareness: number; // business + finance
  sustainabilityAwareness: number; // sustainability + compliance
  digitalAwareness: number; // digital + supply_chain
  totalScore: number;
  strengths: string[];
  recommendations: string[];
}

interface QuizContextType {
  // Quiz state
  questions: IndustryQuestion[];
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  isQuizComplete: boolean;
  
  // Insights
  insights: QuizInsights | null;
  
  // Actions
  setQuestions: (questions: IndustryQuestion[]) => void;
  answerQuestion: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  calculateInsights: () => QuizInsights;
  resetQuiz: () => void;
  clearAllState: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Category to insight mapping
const CATEGORY_MAPPING: Record<string, keyof Pick<QuizInsights, "strategicAwareness" | "sustainabilityAwareness" | "digitalAwareness">> = {
  business: "strategicAwareness",
  finance: "strategicAwareness",
  sustainability: "sustainabilityAwareness",
  compliance: "sustainabilityAwareness",
  digital: "digitalAwareness",
  supply_chain: "digitalAwareness",
};

// Insight recommendations based on scores
const RECOMMENDATIONS: Record<string, { low: string; medium: string; high: string }> = {
  strategicAwareness: {
    low: "Consider exploring industry financial metrics and business strategy fundamentals",
    medium: "Strong foundation in business acumen—expand into advanced strategic planning",
    high: "Excellent strategic perspective—consider mentoring others in business strategy",
  },
  sustainabilityAwareness: {
    low: "Explore ESG frameworks and regulatory compliance in your industry",
    medium: "Good grasp of sustainability—deepen understanding of emerging regulations",
    high: "Strong sustainability leadership—explore innovative green initiatives",
  },
  digitalAwareness: {
    low: "Focus on digital transformation fundamentals and supply chain digitization",
    medium: "Solid digital foundation—explore AI/ML applications in operations",
    high: "Digital-forward mindset—lead Industry 4.0 initiatives in your organization",
  },
};

export function QuizProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<IndustryQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [insights, setInsights] = useState<QuizInsights | null>(null);

  const isQuizComplete = answers.length === questions.length && questions.length > 0;

  const answerQuestion = useCallback((answer: QuizAnswer) => {
    setAnswers(prev => [...prev, answer]);
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1);
  }, []);

  const calculateInsights = useCallback((): QuizInsights => {
    // Calculate scores by insight category
    const categoryScores: Record<string, { correct: number; total: number }> = {
      strategicAwareness: { correct: 0, total: 0 },
      sustainabilityAwareness: { correct: 0, total: 0 },
      digitalAwareness: { correct: 0, total: 0 },
    };

    answers.forEach(answer => {
      const insightCategory = CATEGORY_MAPPING[answer.category];
      if (insightCategory) {
        categoryScores[insightCategory].total += 1;
        if (answer.isCorrect) {
          categoryScores[insightCategory].correct += 1;
        }
      }
    });

    // Calculate percentage scores (0-100)
    const calculatePercentage = (correct: number, total: number) => 
      total > 0 ? Math.round((correct / total) * 100) : 50;

    const strategicAwareness = calculatePercentage(
      categoryScores.strategicAwareness.correct,
      categoryScores.strategicAwareness.total
    );
    const sustainabilityAwareness = calculatePercentage(
      categoryScores.sustainabilityAwareness.correct,
      categoryScores.sustainabilityAwareness.total
    );
    const digitalAwareness = calculatePercentage(
      categoryScores.digitalAwareness.correct,
      categoryScores.digitalAwareness.total
    );

    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalScore = Math.round((totalCorrect / answers.length) * 100);

    // Determine strengths and recommendations
    const strengths: string[] = [];
    const recommendations: string[] = [];

    const scores = [
      { name: "Strategic Awareness", score: strategicAwareness, key: "strategicAwareness" },
      { name: "Sustainability Awareness", score: sustainabilityAwareness, key: "sustainabilityAwareness" },
      { name: "Digital Awareness", score: digitalAwareness, key: "digitalAwareness" },
    ];

    scores.forEach(({ name, score, key }) => {
      if (score >= 80) {
        strengths.push(name);
        recommendations.push(RECOMMENDATIONS[key].high);
      } else if (score >= 50) {
        recommendations.push(RECOMMENDATIONS[key].medium);
      } else {
        recommendations.push(RECOMMENDATIONS[key].low);
      }
    });

    const newInsights: QuizInsights = {
      strategicAwareness,
      sustainabilityAwareness,
      digitalAwareness,
      totalScore,
      strengths,
      recommendations,
    };

    setInsights(newInsights);
    return newInsights;
  }, [answers]);

  const resetQuiz = useCallback(() => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setInsights(null);
  }, []);

  const clearAllState = useCallback(() => {
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setInsights(null);
    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
  }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        answers,
        currentQuestionIndex,
        isQuizComplete,
        insights,
        setQuestions,
        answerQuestion,
        nextQuestion,
        calculateInsights,
        resetQuiz,
        clearAllState,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
