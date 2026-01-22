import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, educationLevel } = body;

    // Validate input
    if (!name || !phone || !educationLevel) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection("users");

    // Check if user with this phone already exists
    const existingUser = await users.findOne({ phone });

    if (existingUser) {
      // Update existing user
      await users.updateOne(
        { phone },
        { 
          $set: { 
            name, 
            educationLevel,
            lastLogin: new Date(),
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: "Welcome back!",
        user: {
          id: existingUser._id.toString(),
          name,
          phone,
          educationLevel,
          sector: existingUser.sector || null,
        },
      });
    }

    // Create new user
    const result = await users.insertOne({
      name,
      phone,
      educationLevel,
      sector: null,
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: result.insertedId.toString(),
        name,
        phone,
        educationLevel,
        sector: null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
