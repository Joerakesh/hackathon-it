import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    // Include password explicitly
    const user = await Participant.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // ✅ bcrypt directly (NO schema method)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { participantId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        participant: {
          id: user._id,
          name: user.name,
          email: user.email,
          paymentStatus: user.payment.status,
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
