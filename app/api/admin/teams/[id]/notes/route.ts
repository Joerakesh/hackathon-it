import { NextRequest, NextResponse } from "next/server";
import AdminNote from "@/models/adminNote.model";
import { connect } from "@/dbconfig/db";
import { Types } from "mongoose";

// POST - Create a new note for a team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, author } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    await connect();

    const teamId = new Types.ObjectId(params.id);

    const newNote = new AdminNote({
      teamId,
      author: author || "Admin",
      content,
    });

    const savedNote = await newNote.save();

    return NextResponse.json(savedNote, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// GET - Fetch all notes for a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ Already correct
) {
  try {
    await connect();

    // ✅ AWAIT the params first (same pattern as main route)
    const { id } = params;
    const teamId = new Types.ObjectId(id);

    const notes = await AdminNote.find({ teamId }).sort({ createdAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
