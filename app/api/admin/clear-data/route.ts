import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * DELETE /api/admin/clear-data
 * Clears all users and sessions data from the database
 * WARNING: This is destructive and should only be used for testing/demo reset
 */
export async function DELETE() {
  try {
    const db = await getDatabase();
    
    // Clear users collection
    const usersResult = await db.collection("users").deleteMany({});
    
    // Clear sessions collection
    const sessionsResult = await db.collection("sessions").deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: "All data cleared successfully",
      cleared: {
        users: usersResult.deletedCount,
        sessions: sessionsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json(
      { error: "Failed to clear data" },
      { status: 500 }
    );
  }
}
