// app/api/admin/participants/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function GET() {
  try {
    await connect();

    // Select everything except the password inside the leader object
    const participants = await Participant.find({ role: "participant" })
      .select("-leader.password")
      .sort({ createdAt: -1 });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Fetch participants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 },
    );
  }
}
