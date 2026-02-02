import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const users = db.collection("users");

    // Count students
    const total = await users.countDocuments({
      userType: "student",
      email: { $exists: true, $ne: null },
    });

    const sent = await users.countDocuments({
      userType: "student",
      email: { $exists: true, $ne: null },
      emailSent: true,
    });

    const pending = total - sent;

    return NextResponse.json({
      pending,
      sent,
      total,
    });
  } catch (error) {
    console.error("Error fetching email stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", pending: 0, sent: 0, total: 0 },
      { status: 500 }
    );
  }
}
