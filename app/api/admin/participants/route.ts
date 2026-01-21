// app/api/admin/participants/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function GET() {
  await connect();

  const participants = await Participant.find({ role: "participant" })
    .select("-password")
    .sort({ createdAt: -1 });

  return NextResponse.json(participants);
}
