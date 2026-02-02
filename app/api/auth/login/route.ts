import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      educationLevel, 
      userType, 
      companyName, 
      companyLocation, 
      businessCardFront, 
      businessCardBack 
    } = body;

    // Validate name for all users
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection("users");

    // Handle based on user type
    if (userType === "professional") {
      // Professional: name, company name, location required
      // Business card images optional
      if (!companyName || !companyName.trim()) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        );
      }

      if (!companyLocation || !companyLocation.trim()) {
        return NextResponse.json(
          { error: "Location is required" },
          { status: 400 }
        );
      }

      // Allow multiple professionals with same name (no duplicate check needed)
      // Each professional signup is unique

      const professionalData = {
        name: name.trim(),
        userType: "professional",
        companyName: companyName.trim(),
        companyLocation: companyLocation.trim(),
        businessCardFront: businessCardFront || null,
        businessCardBack: businessCardBack || null,
        // Clear student fields
        email: null,
        phone: null,
        educationLevel: null,
        lastLogin: new Date(),
      };

      // Create new professional
      const result = await users.insertOne({
        ...professionalData,
        sector: null,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: result.insertedId.toString(),
          ...professionalData,
          sector: null,
        },
        redirectTo: "globe", // Professionals go to globe
      });

    } else {
      // Student: name, email, phone, education level required
      if (!email || !email.trim()) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      if (!phone || !phone.trim()) {
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: 400 }
        );
      }

      if (!educationLevel || !educationLevel.trim()) {
        return NextResponse.json(
          { error: "Education level is required" },
          { status: 400 }
        );
      }

      // Check if student already exists (by phone number)
      const existingByPhone = await users.findOne({
        phone: phone.trim(),
        userType: { $ne: "professional" }
      });

      // Reject duplicate signup by phone
      if (existingByPhone) {
        return NextResponse.json(
          { error: "This phone number is already registered. Each person can only sign up once." },
          { status: 409 }
        );
      }

      const studentData = {
        name: name.trim(),
        userType: "student",
        email: email.trim(),
        phone: phone.trim(),
        educationLevel: educationLevel.trim(),
        // Clear professional fields
        companyName: null,
        companyLocation: null,
        businessCardFront: null,
        businessCardBack: null,
        lastLogin: new Date(),
      };

      // Create new student with emailSent: false (will be sent by local endpoint)
      const result = await users.insertOne({
        ...studentData,
        sector: null,
        emailSent: false,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: result.insertedId.toString(),
          ...studentData,
          sector: null,
        },
        redirectTo: "sector-wheel", // Students go to sector wheel
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
