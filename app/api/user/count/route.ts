import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/user/count
 * Returns count of professional users who signed up
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const users = db.collection("users");

    // Count professional users
    const professionalCount = await users.countDocuments({
      userType: "professional"
    });

    return NextResponse.json({
      success: true,
      count: professionalCount,
    });
  } catch (error) {
    console.error("Error counting users:", error);
    return NextResponse.json(
      { error: "Failed to count users" },
      { status: 500 }
    );
  }
}
