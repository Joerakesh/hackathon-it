import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function POST(req: Request) {
  try {
    await connect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // ✅ Correct path + include hidden password
    const participant = await Participant.findOne({
      "leader.email": email.toLowerCase(),
    }).select("+leader.password");

    if (!participant) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // ✅ Use schema method
    const isMatch = await participant.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // ✅ Stronger token payload
    const token = jwt.sign(
      {
        id: participant._id,
        participantId: participant.participantId,
        role: participant.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        participant: {
          id: participant._id,
          participantId: participant.participantId,
          name: participant.leader.name,
          email: participant.leader.email,
          role: participant.role,
          paymentStatus: participant.payment.status,
        },
      },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("❌ Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
