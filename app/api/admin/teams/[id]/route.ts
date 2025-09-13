import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/team.model";

connect();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Remove Promise
) {
  const { id } = await context.params;
  const team = await Team.findById(id);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(team, { status: 200 });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const updatedTeam = await Team.findByIdAndUpdate(id, body, { new: true });

  if (!updatedTeam) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(updatedTeam, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deletedTeam = await Team.findByIdAndDelete(id);

  if (!deletedTeam) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "Team deleted successfully" },
    { status: 200 }
  );
}
