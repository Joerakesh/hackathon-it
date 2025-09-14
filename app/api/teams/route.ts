import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/team.model";

export async function GET() {
  await connect();
  const teams = await Team.find(
    {},
    { teamId: 1, teamLeader: 1, teamMembers: 1 }
  ).lean();
  return NextResponse.json(teams);
}
