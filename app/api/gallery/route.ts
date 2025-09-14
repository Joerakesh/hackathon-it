import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Gallery from "@/models/gallery.model";

export async function GET(req: Request) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
    }

    const gallery = await Gallery.findOne({ teamId });

    if (!gallery) {
      return NextResponse.json({ galleryLink: null }); // ✅ always JSON
    }

    return NextResponse.json(gallery);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const { teamId, folderUrl, images } = await req.json();

    if (!teamId || (!folderUrl && !images)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Store folderUrl or images array
    const gallery = await Gallery.findOneAndUpdate(
      { teamId },
      {
        $set: {
          folderUrl: folderUrl || undefined,
          images: images || [],
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(gallery);
  } catch (err) {
    console.error("Gallery upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
