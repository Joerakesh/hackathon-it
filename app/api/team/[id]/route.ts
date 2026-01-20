import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/team.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }, // 👈 params must be awaited
) {
  try {
    await connect();

    // ✅ Await cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        teamId: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ Await params
    const { id } = await context.params;
    if (decoded.teamId !== id) {
      return NextResponse.json(
        { error: "You are not allowed to update this team" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { teamLeader, teamMembers } = body;

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (teamLeader) {
      team.teamLeader.name = teamLeader.name || team.teamLeader.name;
      team.teamLeader.college = teamLeader.college || team.teamLeader.college;
      team.teamLeader.city = teamLeader.city || team.teamLeader.city;
      team.teamLeader.phoneNumber =
        teamLeader.phoneNumber || team.teamLeader.phoneNumber;
      team.teamLeader.email = teamLeader.email || team.teamLeader.email;
      team.teamLeader.teamSize =
        teamLeader.teamSize || team.teamLeader.teamSize;
    }

    if (teamMembers) {
      team.teamMembers = teamMembers;
    }

    await team.save();

    return NextResponse.json(
      { message: "Team updated successfully", team },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Error updating team:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
