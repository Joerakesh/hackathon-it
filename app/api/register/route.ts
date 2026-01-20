import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";
import QRCode from "qrcode";
import { sendRegistrationMail } from "@/lib/email/sendRegistrationMail";

interface RegistrationPayload {
  name: string;
  email: string;
  college: string;
  department: string;
  city: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export async function POST(req: Request) {
  try {
    await connect();

    const data: RegistrationPayload = await req.json();

    /* ---------- Validation ---------- */
    if (data.password !== data.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (
      !data.name ||
      !data.email ||
      !data.college ||
      !data.department ||
      !data.city ||
      !data.phoneNumber
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    /* ---------- Duplicate check ---------- */
    const existing = await Participant.findOne({
      $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 409 },
      );
    }

    /* ---------- Create participant ---------- */
    const participant = await Participant.create({
      name: data.name,
      email: data.email,
      college: data.college,
      department: data.department,
      city: data.city,
      phoneNumber: data.phoneNumber,
      password: data.password, // hashed by schema middleware
      event: "GLITCH FIX",
      participationType: "Individual",
      payment: {
        amount: 250,
        status: "pending",
        updatedAt: new Date(),
      },
    });

    /* ---------- Generate QR ---------- */
    const upiUrl = `upi://pay?pa=rakeshjoe52@oksbi&pn=GLITCH%20FIX&am=250&cu=INR&tn=${participant._id}`;
    const qrBuffer = await QRCode.toBuffer(upiUrl, {
      width: 220,
      margin: 1,
    });

    const qrBase64 = qrBuffer.toString("base64");

    /* ---------- Send SES email ---------- */
    await sendRegistrationMail({
      to: participant.email,
      name: participant.name,
      participantId: participant._id.toString(),
      qrBase64,
    });

    return NextResponse.json(
      { message: "Registration successful", id: participant._id },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
