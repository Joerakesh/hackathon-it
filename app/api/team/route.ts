import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/participant.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connect();

    const cookieStore = await cookies(); // ✅ must await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        teamId: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const team = await Team.findById(decoded.teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching team:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
