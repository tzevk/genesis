import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// POST - Log anonymized quiz results
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insights, answers, timestamp } = body;
    
    // Anonymized result - no personal identifiers
    const anonymizedResult = {
      timestamp: timestamp || new Date().toISOString(),
      strategicAwareness: insights.strategicAwareness,
      sustainabilityAwareness: insights.sustainabilityAwareness,
      digitalAwareness: insights.digitalAwareness,
      totalScore: insights.totalScore,
      categoryBreakdown: answers.reduce((acc: Record<string, { correct: number; total: number }>, answer: { category: string; isCorrect: boolean }) => {
        if (!acc[answer.category]) {
          acc[answer.category] = { correct: 0, total: 0 };
        }
        acc[answer.category].total += 1;
        if (answer.isCorrect) {
          acc[answer.category].correct += 1;
        }
        return acc;
      }, {}),
      questionsAnswered: answers.length,
      createdAt: new Date(),
    };
    
    const client = await clientPromise;
    const db = client.db("genesis");
    
    await db.collection("industry_quiz_results").insertOne(anonymizedResult);
    
    return NextResponse.json({
      success: true,
      message: "Quiz results logged successfully",
    });
  } catch (error) {
    console.error("Failed to log quiz results:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log results" },
      { status: 500 }
    );
  }
}

// GET - Aggregate insights for analytics (optional admin use)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("genesis");
    
    const aggregateStats = await db.collection("industry_quiz_results").aggregate([
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          avgStrategic: { $avg: "$strategicAwareness" },
          avgSustainability: { $avg: "$sustainabilityAwareness" },
          avgDigital: { $avg: "$digitalAwareness" },
          avgTotalScore: { $avg: "$totalScore" },
        },
      },
    ]).toArray();
    
    return NextResponse.json({
      success: true,
      stats: aggregateStats[0] || {
        totalQuizzes: 0,
        avgStrategic: 0,
        avgSustainability: 0,
        avgDigital: 0,
        avgTotalScore: 0,
      },
    });
  } catch (error) {
    console.error("Failed to get aggregate stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
