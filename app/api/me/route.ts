import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function GET(req: Request) {
  try {
    await connect();

    // 🍪 Read token from cookies
    const token = req.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔐 Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      participantId: string;
    };

    // 🔎 Fetch participant
    const participant = await Participant.findById(
      decoded.participantId,
    ).select("-password");

    if (!participant) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Return participant
    return NextResponse.json(participant, { status: 200 });
  } catch (err) {
    console.error("❌ /api/me error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
