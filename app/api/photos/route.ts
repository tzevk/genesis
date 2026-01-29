import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * POST /api/photos
 * Save a captured photo to the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photo, userName, companyName } = body;

    if (!photo || !userName) {
      return NextResponse.json(
        { error: "Photo and userName are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const photos = db.collection("photos");

    const photoDoc = {
      photo, // base64 image data
      userName,
      companyName: companyName || "Professional Visitor",
      capturedAt: new Date(),
    };

    const result = await photos.insertOne(photoDoc);

    return NextResponse.json({
      success: true,
      photoId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving photo:", error);
    return NextResponse.json(
      { error: "Failed to save photo" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photos
 * Fetch all photos for the photo wall
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const photos = db.collection("photos");

    // Get all photos, sorted by most recent first
    const allPhotos = await photos
      .find({})
      .sort({ capturedAt: -1 })
      .limit(100) // Limit to last 100 photos
      .toArray();

    // Transform for response (include only necessary fields)
    const photoList = allPhotos.map((p) => ({
      id: p._id.toString(),
      photo: p.photo,
      userName: p.userName,
      companyName: p.companyName,
      capturedAt: p.capturedAt,
    }));

    return NextResponse.json({
      success: true,
      photos: photoList,
      count: photoList.length,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/photos
 * Delete all photos from the database
 */
export async function DELETE() {
  try {
    const db = await getDatabase();
    const photos = db.collection("photos");

    const result = await photos.deleteMany({});

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting photos:", error);
    return NextResponse.json(
      { error: "Failed to delete photos" },
      { status: 500 }
    );
  }
}
