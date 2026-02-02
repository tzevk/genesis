import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * POST /api/user/quiz-score
 * Saves the user's industry quiz score to the database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, score, totalQuestions, correctAnswers, insights } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (score === undefined || score === null) {
      return NextResponse.json(
        { error: "Score is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const sessions = db.collection("sessions");
    const users = db.collection("users");

    // Get session to find user
    const session = await sessions.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Find user by phone from session
    const phone = session.phone;
    if (!phone) {
      return NextResponse.json(
        { error: "No phone number associated with session" },
        { status: 400 }
      );
    }

    const existingUser = await users.findOne({ phone });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate score out of 10
    const scoreOutOf10 = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 10) 
      : score;

    // Update user record with quiz score
    const updateData: Record<string, unknown> = {
      industryQuizScore: scoreOutOf10,
      industryQuizCorrectAnswers: correctAnswers,
      industryQuizTotalQuestions: totalQuestions,
      industryQuizCompletedAt: new Date(),
      updatedAt: new Date(),
    };

    // Store insights if provided
    if (insights) {
      updateData.industryQuizInsights = {
        strategicAwareness: insights.strategicAwareness,
        sustainabilityAwareness: insights.sustainabilityAwareness,
        digitalAwareness: insights.digitalAwareness,
        totalScore: insights.totalScore,
        strengths: insights.strengths,
        recommendations: insights.recommendations,
      };
    }

    await users.updateOne(
      { phone },
      { $set: updateData }
    );

    // Also update session with quiz completion status
    await sessions.updateOne(
      { sessionId },
      { 
        $set: { 
          industryQuizCompleted: true,
          industryQuizScore: scoreOutOf10,
          updatedAt: new Date(),
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: "Quiz score saved successfully",
      score: scoreOutOf10,
    });
  } catch (error) {
    console.error("Error saving quiz score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/quiz-score
 * Retrieves the user's industry quiz score
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const sessions = db.collection("sessions");
    const users = db.collection("users");

    // Get session to find user
    const session = await sessions.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const phone = session.phone;
    if (!phone) {
      return NextResponse.json(
        { error: "No phone number associated with session" },
        { status: 400 }
      );
    }

    const user = await users.findOne(
      { phone },
      {
        projection: {
          industryQuizScore: 1,
          industryQuizCorrectAnswers: 1,
          industryQuizTotalQuestions: 1,
          industryQuizCompletedAt: 1,
          industryQuizInsights: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quizScore: user.industryQuizScore ?? null,
      correctAnswers: user.industryQuizCorrectAnswers ?? null,
      totalQuestions: user.industryQuizTotalQuestions ?? null,
      completedAt: user.industryQuizCompletedAt ?? null,
      insights: user.industryQuizInsights ?? null,
      hasCompletedQuiz: user.industryQuizScore !== undefined,
    });
  } catch (error) {
    console.error("Error fetching quiz score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
