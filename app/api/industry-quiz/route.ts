import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Industry quiz question categories
const CATEGORIES = ["business", "sustainability", "supply_chain", "digital", "compliance", "finance"];

// Default questions if MongoDB collection is empty
const DEFAULT_QUESTIONS = [
  {
    question: "What does ESG stand for in corporate sustainability reporting?",
    options: [
      "Environmental, Social, and Governance",
      "Economic, Strategic, and Growth",
      "Enterprise, Systems, and Guidelines",
      "Efficiency, Sustainability, and Green"
    ],
    correct: 0,
    category: "sustainability",
    explanation: "ESG stands for Environmental, Social, and Governance—the three central pillars used to measure sustainability and ethical impact of investments and business practices."
  },
  {
    question: "In supply chain management, what does 'Just-in-Time' (JIT) primarily aim to reduce?",
    options: [
      "Employee overtime",
      "Inventory holding costs",
      "Transportation distance",
      "Product variety"
    ],
    correct: 1,
    category: "supply_chain",
    explanation: "Just-in-Time manufacturing aims to reduce inventory holding costs by receiving goods only as they are needed, minimizing storage and waste."
  },
  {
    question: "What is the primary purpose of a Digital Twin in industrial operations?",
    options: [
      "Creating backup servers",
      "Virtual simulation of physical assets",
      "Duplicating employee access",
      "Mirroring financial data"
    ],
    correct: 1,
    category: "digital",
    explanation: "A Digital Twin is a virtual replica of a physical asset, process, or system that allows for real-time monitoring, simulation, and optimization."
  },
  {
    question: "Which financial metric measures a company's ability to pay short-term obligations?",
    options: [
      "Return on Investment (ROI)",
      "Current Ratio",
      "Gross Margin",
      "EBITDA"
    ],
    correct: 1,
    category: "finance",
    explanation: "The Current Ratio (current assets / current liabilities) measures a company's ability to pay short-term obligations within one year."
  },
  {
    question: "What does SCADA stand for in industrial automation?",
    options: [
      "System Control and Data Acquisition",
      "Supervisory Control and Data Acquisition",
      "Standard Computer Aided Design Application",
      "Sequential Control and Digital Analysis"
    ],
    correct: 1,
    category: "digital",
    explanation: "SCADA (Supervisory Control and Data Acquisition) is a control system architecture used for high-level process supervisory management in industrial operations."
  },
  {
    question: "In EPC projects, what does the acronym stand for?",
    options: [
      "Engineering, Planning, and Construction",
      "Engineering, Procurement, and Construction",
      "Execution, Planning, and Commissioning",
      "Environmental Protection and Compliance"
    ],
    correct: 1,
    category: "business",
    explanation: "EPC stands for Engineering, Procurement, and Construction—a contracting model where a single contractor handles all phases of a project."
  },
  {
    question: "What is the ISO 14001 standard primarily concerned with?",
    options: [
      "Quality Management",
      "Information Security",
      "Environmental Management",
      "Occupational Health and Safety"
    ],
    correct: 2,
    category: "compliance",
    explanation: "ISO 14001 specifies requirements for an effective environmental management system (EMS) to help organizations reduce their environmental footprint."
  },
  {
    question: "What is 'Scope 3' emissions in carbon accounting?",
    options: [
      "Direct emissions from owned sources",
      "Indirect emissions from purchased energy",
      "Indirect emissions from the value chain",
      "Emissions from employee commuting only"
    ],
    correct: 2,
    category: "sustainability",
    explanation: "Scope 3 covers all indirect emissions in a company's value chain—both upstream (suppliers) and downstream (product use, disposal)."
  },
  {
    question: "What does 'Industry 4.0' primarily refer to?",
    options: [
      "The fourth industrial revolution featuring cyber-physical systems",
      "A quality certification for manufacturing",
      "The fourth quarter financial planning cycle",
      "A safety standard for industrial equipment"
    ],
    correct: 0,
    category: "digital",
    explanation: "Industry 4.0 refers to the fourth industrial revolution, characterized by smart factories, IoT, AI, and cyber-physical systems integration."
  },
  {
    question: "In business strategy, what does CAPEX refer to?",
    options: [
      "Capital Expenditure",
      "Capacity Expansion",
      "Capital Export",
      "Customer Acquisition Premium"
    ],
    correct: 0,
    category: "finance",
    explanation: "CAPEX (Capital Expenditure) refers to funds used to acquire, upgrade, or maintain physical assets like property, buildings, or equipment."
  },
  {
    question: "What is the primary goal of a 'Circular Economy' model?",
    options: [
      "Maximizing production speed",
      "Eliminating waste through reuse and recycling",
      "Centralizing manufacturing operations",
      "Increasing quarterly profits"
    ],
    correct: 1,
    category: "sustainability",
    explanation: "A Circular Economy aims to eliminate waste by keeping products, materials, and resources in use as long as possible through reuse, repair, and recycling."
  },
  {
    question: "What does SOC 2 compliance demonstrate about an organization?",
    options: [
      "Financial audit readiness",
      "Security, availability, and data privacy controls",
      "Environmental sustainability practices",
      "Employee safety standards"
    ],
    correct: 1,
    category: "compliance",
    explanation: "SOC 2 compliance demonstrates that an organization has implemented controls for security, availability, processing integrity, confidentiality, and privacy."
  },
  {
    question: "In project management, what is a 'Critical Path'?",
    options: [
      "The most dangerous route in a facility",
      "The longest sequence of dependent tasks determining project duration",
      "The path requiring highest budget",
      "The route for executive approvals"
    ],
    correct: 1,
    category: "business",
    explanation: "The Critical Path is the longest sequence of dependent tasks that determines the minimum project duration—any delay on this path delays the entire project."
  },
  {
    question: "What is the primary function of an ERP system?",
    options: [
      "Email management",
      "Integrating core business processes",
      "External regulatory reporting",
      "Employee recruitment planning"
    ],
    correct: 1,
    category: "digital",
    explanation: "ERP (Enterprise Resource Planning) systems integrate core business processes—finance, HR, manufacturing, supply chain—into a single unified system."
  },
  {
    question: "What does 'Net Zero' commitment mean for a company?",
    options: [
      "Zero profit margin",
      "Balancing emissions produced with emissions removed",
      "No net investment",
      "Zero employee turnover"
    ],
    correct: 1,
    category: "sustainability",
    explanation: "Net Zero means achieving a balance between greenhouse gas emissions produced and emissions removed from the atmosphere, typically through reduction and offsetting."
  }
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle options while keeping track of correct answer
function shuffleOptions(question: typeof DEFAULT_QUESTIONS[0]) {
  const optionsWithIndex = question.options.map((opt, idx) => ({ opt, isCorrect: idx === question.correct }));
  const shuffledOptions = shuffleArray(optionsWithIndex);
  const newCorrectIndex = shuffledOptions.findIndex(o => o.isCorrect);
  
  return {
    ...question,
    options: shuffledOptions.map(o => o.opt),
    correct: newCorrectIndex,
  };
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("genesis");
    
    // Try to get questions from MongoDB using $sample for random selection
    let questions = await db
      .collection("industry_quiz_questions")
      .aggregate([{ $sample: { size: 5 } }])
      .toArray();
    
    // If no questions in DB, use defaults and try to seed the collection
    if (questions.length === 0) {
      // Seed the database with default questions
      try {
        await db.collection("industry_quiz_questions").insertMany(DEFAULT_QUESTIONS);
      } catch {
        // Collection might already exist, ignore
      }
      
      // Get 5 random from defaults
      questions = shuffleArray(DEFAULT_QUESTIONS).slice(0, 5);
    }
    
    // Shuffle questions and their options
    const shuffledQuestions = shuffleArray(questions).map(q => {
      const shuffled = shuffleOptions({
        question: q.question,
        options: q.options,
        correct: q.correct,
        category: q.category,
        explanation: q.explanation,
      });
      
      return {
        _id: q._id?.toString() || Math.random().toString(36).substr(2, 9),
        ...shuffled,
      };
    });
    
    return NextResponse.json({
      success: true,
      questions: shuffledQuestions,
    });
  } catch (error) {
    console.error("Failed to fetch industry quiz questions:", error);
    
    // Fallback to default questions
    const shuffledDefaults = shuffleArray(DEFAULT_QUESTIONS)
      .slice(0, 5)
      .map(q => ({
        _id: Math.random().toString(36).substr(2, 9),
        ...shuffleOptions(q),
      }));
    
    return NextResponse.json({
      success: true,
      questions: shuffledDefaults,
    });
  }
}
