import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/participant.model";

export async function GET() {
  await connect();
  const teams = await Team.find().sort({ createdAt: -1 });
  return NextResponse.json(teams);
}

export async function POST(req: NextRequest) {
  await connect();
  const data = await req.json();

  try {
    const newTeam = await Team.create(data);
    return NextResponse.json(newTeam, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
