import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/user
 * Fetches user data from database by phone number
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection("users");

    const user = await users.findOne(
      { phone },
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
          createdAt: 1,
          updatedAt: 1,
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
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        educationLevel: user.educationLevel,
        sector: user.sector || user.lastSector,
        bestScore: user.bestScore,
        lastScore: user.lastScore,
        attemptCount: user.attemptCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
