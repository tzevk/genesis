import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// Timer duration in seconds (must match client TIMER_DURATION)
const TIMER_DURATION = 150; // 2:30
// Minimum time required to submit (prevents instant submissions)
const MIN_TIME_SPENT_SECONDS = 10;
// Grace period for network latency (seconds)
const TIME_GRACE_PERIOD = 5;

/**
 * POST /api/user/score
 * Saves the user's simulation score to the database
 * Only updates if new score is higher (prevents leaderboard spam)
 * Validates time spent server-side to prevent timer manipulation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, sector, score, slots, timeLeft, completedAt } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
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
    const users = db.collection("users");

    // Check if user exists and validate session
    const existingUser = await users.findOne({ phone });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found. Please login first." },
        { status: 404 }
      );
    }

    // Server-side time validation
    let validatedScore = score;
    let timeWarning: string | null = null;

    if (existingUser.currentSessionStart) {
      const sessionStart = new Date(existingUser.currentSessionStart);
      const now = new Date();
      const actualTimeSpentSeconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      
      // Calculate expected time spent based on client's timeLeft
      const clientTimeSpent = TIMER_DURATION - (timeLeft || 0);
      
      // Check for timer manipulation
      if (actualTimeSpentSeconds < MIN_TIME_SPENT_SECONDS) {
        // Too fast - likely cheating, reject or heavily penalize
        validatedScore = 0;
        timeWarning = "Submission too fast. Score invalidated.";
      } else if (actualTimeSpentSeconds < clientTimeSpent - TIME_GRACE_PERIOD) {
        // Client claims more time spent than actually elapsed - suspicious
        // Penalize score by 50%
        validatedScore = Math.floor(score * 0.5);
        timeWarning = "Time discrepancy detected. Score adjusted.";
      }
    } else {
      // No session start recorded - penalize but allow submission
      validatedScore = Math.floor(score * 0.75);
      timeWarning = "No session start recorded. Score adjusted.";
    }

    const currentBestScore = existingUser.bestScore ?? existingUser.lastScore ?? 0;
    
    // Only update bestScore if new validated score is higher
    const newBestScore = Math.max(currentBestScore, validatedScore);
    
    await users.updateOne(
      { phone },
      {
        $set: {
          lastScore: validatedScore,
          lastSector: sector,
          lastSlots: slots,
          lastTimeLeft: timeLeft,
          lastCompletedAt: completedAt || new Date(),
          bestScore: newBestScore,
          updatedAt: new Date(),
          // Clear session after submission
          currentSessionActive: false,
          lastSessionEnd: new Date(),
          // Track attempt count
          attemptCount: (existingUser.attemptCount || 0) + 1,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: validatedScore > currentBestScore 
        ? "New high score!" 
        : "Score saved (best score unchanged)",
      score: validatedScore,
      originalScore: score,
      bestScore: newBestScore,
      isNewHighScore: validatedScore > currentBestScore,
      timeWarning,
    });
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
