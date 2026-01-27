import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * POST /api/session
 * Creates a new session with user data stored in MongoDB
 * Returns a sessionId that the client uses to identify themselves
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, name, educationLevel, sector } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const sessions = db.collection("sessions");

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    // Create or update session
    await sessions.updateOne(
      { phone },
      {
        $set: {
          sessionId,
          phone,
          email,
          name,
          educationLevel,
          sector,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/session
 * Retrieves session data by sessionId
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

    const session = await sessions.findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Also fetch full user data from users collection
    const users = db.collection("users");
    const user = await users.findOne(
      { phone: session.phone },
      {
        projection: {
          _id: 1,
          name: 1,
          phone: 1,
          educationLevel: 1,
          sector: 1,
          lastSector: 1,
          bestScore: 1,
          lastScore: 1,
          attemptCount: 1,
        },
      }
    );

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        phone: session.phone,
        name: session.name || user?.name,
        educationLevel: session.educationLevel || user?.educationLevel,
        sector: session.sector || user?.sector || user?.lastSector,
        bestScore: user?.bestScore,
        lastScore: user?.lastScore,
        attemptCount: user?.attemptCount,
        userId: user?._id?.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/session
 * Updates session data (e.g., sector selection)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, ...updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const sessions = db.collection("sessions");

    const result = await sessions.updateOne(
      { sessionId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session updated",
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/session
 * Clears/deletes a session
 */
export async function DELETE(request: Request) {
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

    await sessions.deleteOne({ sessionId });

    return NextResponse.json({
      success: true,
      message: "Session cleared",
    });
  } catch (error) {
    console.error("Error clearing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
