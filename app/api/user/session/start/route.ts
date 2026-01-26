import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * POST /api/user/session/start
 * Records simulation start time in the database to prevent timer manipulation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection("users");

    const startTime = new Date();
    
    // Update user with session start time
    const result = await users.updateOne(
      { phone },
      {
        $set: {
          currentSessionStart: startTime,
          currentSessionActive: true,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      startTime: startTime.toISOString(),
      message: "Session started",
    });
  } catch (error) {
    console.error("Error starting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
