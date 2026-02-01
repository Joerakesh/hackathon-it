// app/api/me/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

interface JwtPayload {
  id: string; // Mongo _id
  participantId: string;
  role: "participant" | "admin";
}

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const participant = await Participant.findById(decoded.id).select(
      "-leader.password",
    );

    if (!participant) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔐 Optional payment gate (recommended)
    if (
      decoded.role === "participant" &&
      participant.payment.status === "rejected"
    ) {
      return NextResponse.json({ error: "Payment rejected" }, { status: 403 });
    }

    // ✅ FLATTENED RESPONSE (IMPORTANT)
    return NextResponse.json(
      {
        _id: participant._id.toString(),
        participantId: participant.participantId,
        event: participant.event || "GLITCH FIX", // Ensure this is sent!
        participationType: participant.participationType,
        role: participant.role,
        // Keep the nested structure or flatten it consistently
        leader: {
          name: participant.leader.name,
          email: participant.leader.email,
          college: participant.leader.college,
          department: participant.leader.department,
          city: participant.leader.city,
        },
        member: participant.member, // Include the member object
        payment: participant.payment,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ /api/me error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
