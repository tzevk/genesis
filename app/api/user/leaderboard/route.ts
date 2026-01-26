import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/user/leaderboard
 * Returns top scores - one entry per phone number (best score only)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sector = searchParams.get("sector"); // Optional sector filter

    const db = await getDatabase();
    const users = db.collection("users");

    // Build query - only include users with a bestScore
    const query: Record<string, unknown> = {
      bestScore: { $exists: true, $ne: null },
    };

    // Filter by sector if provided
    if (sector) {
      query.lastSector = sector;
    }

    // Get top scores, sorted by bestScore descending
    // Each phone number appears only once (unique constraint by document)
    const leaderboard = await users
      .find(query)
      .project({
        _id: 0,
        name: 1,
        phone: 1,
        bestScore: 1,
        lastSector: 1,
        attemptCount: 1,
        updatedAt: 1,
      })
      .sort({ bestScore: -1, updatedAt: 1 }) // Highest score first, earlier submission wins ties
      .limit(Math.min(limit, 100)) // Cap at 100 max
      .toArray();

    // Mask phone numbers for privacy (show last 4 digits only)
    const maskedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.name || "Anonymous",
      phone: entry.phone ? `****${entry.phone.slice(-4)}` : "****",
      score: entry.bestScore,
      sector: entry.lastSector,
      attempts: entry.attemptCount || 1,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: maskedLeaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
