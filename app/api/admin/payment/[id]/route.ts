import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";
import sgMail from "@sendgrid/mail";
import path from "path";
import fs from "fs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

type MailAttachment = {
  content: string;
  filename: string;
  type: string;
  disposition: "attachment";
};
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await connect();

  const { id } = params;
  const { action } = await req.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const participant = await Participant.findById(id);
  if (!participant) {
    return NextResponse.json(
      { error: "Participant not found" },
      { status: 404 },
    );
  }

  participant.payment.status = action === "approve" ? "approved" : "rejected";
  participant.payment.updatedAt = new Date();
  await participant.save();

  /* ---------- Attachments (only for approve) ---------- */
  let attachments: MailAttachment[] = [];

  if (action === "approve") {
    const rulesPath = path.join(process.cwd(), "public/docs/rules.pdf");
    const schedulePath = path.join(process.cwd(), "public/docs/schedule.pdf");

    attachments = [
      {
        content: fs.readFileSync(rulesPath).toString("base64"),
        filename: "rules.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
      {
        content: fs.readFileSync(schedulePath).toString("base64"),
        filename: "schedule.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ];
  }

  /* ---------- Email ---------- */
  await sgMail.send({
    to: participant.email,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject:
      action === "approve"
        ? "✅ Payment Approved – GLITCH FIX Registration Confirmed"
        : "❌ Payment Rejected – GLITCH FIX",
    html:
      action === "approve"
        ? `
          <h2>Payment Approved ✅</h2>
          <p>Hi <strong>${participant.name}</strong>,</p>
          <p>Your payment of <strong>₹${participant.payment.amount}</strong> has been approved.</p>
          <p><strong>Participant ID:</strong> ${participant._id}</p>
          <p>📍 Venue: Sacred Heart College</p>
          <p>📅 Date: February 6</p>
          <p>⚠️ Bring your laptop. No mobile phones allowed.</p>
        `
        : `
          <h2>Payment Rejected ❌</h2>
          <p>Hi <strong>${participant.name}</strong>,</p>
          <p>Your payment of <strong>₹${participant.payment.amount}</strong> could not be approved.</p>
          <p>Please contact support if this is a mistake.</p>
        `,
    attachments,
  });

  return NextResponse.json({
    message: `Payment ${action}d successfully`,
    payment: participant.payment,
  });
}
