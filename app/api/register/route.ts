import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";
import QRCode from "qrcode";
import { sendRegistrationMail } from "@/lib/email/sendRegistrationMail";

export async function POST(req: Request) {
  try {
    await connect();

    const { leader, member } = await req.json();

    /* ---------- Validation ---------- */
    if (!leader) {
      return NextResponse.json(
        { error: "Leader details are missing or invalid" },
        { status: 400 },
      );
    }

    if (leader.password !== leader.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    const requiredLeaderFields = [
      leader.name,
      leader.email,
      leader.phoneNumber,
      leader.college,
      leader.department,
      leader.city,
      leader.password,
    ];

    if (requiredLeaderFields.some((v) => !v)) {
      return NextResponse.json(
        { error: "Missing required leader fields" },
        { status: 400 },
      );
    }
    const amount = 300;
    const hasMemberData =
      member && (member.name || member.email || member.phoneNumber);
    if (hasMemberData) {
      if (!member.name || !member.email || !member.phoneNumber) {
        return NextResponse.json(
          { error: "Please complete all member details or leave it empty" },
          { status: 400 },
        );
      }
    }

    /* ---------- Duplicate leader check ---------- */
    const existing = await Participant.findOne({
      $or: [
        { "leader.email": leader.email },
        { "leader.phoneNumber": leader.phoneNumber },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Leader already registered for this event" },
        { status: 409 },
      );
    }

    /* ---------- Create participant ---------- */
    const participant = await Participant.create({
      leader: {
        name: leader.name,
        email: leader.email,
        phoneNumber: leader.phoneNumber,
        college: leader.college,
        department: leader.department,
        city: leader.city,
        password: leader.password,
      },
      member: hasMemberData
        ? {
            name: member.name,
            email: member.email,
            phoneNumber: member.phoneNumber,
          }
        : undefined,
      payment: {
        amount,
        status: "pending",
        updatedAt: new Date(),
      },
    });

    /* ---------- Generate QR ---------- */
    const upiUrl = `upi://pay?pa=7094594221@naviaxis&pn=GLITCH%20FIX&am=${amount}&cu=INR&tn=${participant.participantId}`;

    const qrBase64 = (
      await QRCode.toBuffer(upiUrl, { width: 220, margin: 1 })
    ).toString("base64");

    /* ---------- Send Email (Leader only) ---------- */
    await sendRegistrationMail({
      to: participant.leader.email,
      name: participant.leader.name,
      participantId: participant.participantId,
      qrBase64,
    });

    return NextResponse.json(
      {
        message: "Team registration successful",
        participantId: participant.participantId,
      },
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
