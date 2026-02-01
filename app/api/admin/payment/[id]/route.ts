import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import fs from "fs";
import path from "path";

const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  await connect();

  const { id } = await context.params;
  const { action } = await req.json();

  if (!["approve", "reject", "pending"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const participant = await Participant.findById(id);
  if (!participant) {
    return NextResponse.json(
      { error: "Participant not found" },
      { status: 404 },
    );
  }

  /* ---------- UPDATE PAYMENT STATUS ---------- */
  participant.payment.status =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : "pending";
  participant.payment.updatedAt = new Date();
  await participant.save();

  /* ---------- EMAIL ONLY FOR APPROVE / REJECT ---------- */
  if (action === "approve" || action === "reject") {
    // FIX: Accessing nested leader data
    const recipientEmail = participant.leader.email;
    const leaderName = participant.leader.name;
    const displayId = participant.participantId; // Use the formatted ID (SHCCSGF003)

    const boundary = "PaymentBoundary123";
    let attachmentsBlock = "";

    if (action === "approve") {
      try {
        const rulesPath = path.join(process.cwd(), "public/docs/rules.pdf");
        const schedulePath = path.join(
          process.cwd(),
          "public/docs/schedule.pdf",
        );

        const rulesBase64 = fs.readFileSync(rulesPath).toString("base64");
        const scheduleBase64 = fs.readFileSync(schedulePath).toString("base64");

        attachmentsBlock = `
--${boundary}
Content-Type: application/pdf
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="rules.pdf"

${rulesBase64}

--${boundary}
Content-Type: application/pdf
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="schedule.pdf"

${scheduleBase64}`;
      } catch (err) {
        console.error("PDF Attachment Error:", err);
        // Continue without attachments if files are missing
      }
    }

    const htmlBody =
      action === "approve"
        ? `<h2>Payment Approved ✅</h2>
          <p>Hi <strong>${leaderName}</strong>,</p>
          <p>Your payment for <strong>${participant.event}</strong> has been approved.</p>
          <p><strong>Participant ID:</strong> ${displayId}</p>
          <p>📍 Venue: Sacred Heart College</p>
          <p>📅 Date: February 6, 2026</p>
          <p style="color:#991b1b;font-weight:bold;">⚠️ Bring your laptop. No mobile phones allowed.</p>`
        : `<h2>Payment Rejected ❌</h2>
          <p>Hi <strong>${leaderName}</strong>,</p>
          <p>Your payment of <strong>₹${participant.payment.amount}</strong> could not be approved.</p>
          <p>Please contact support if this is a mistake.</p>`;

    const rawEmail = `From: ${process.env.AWS_SES_SENDER}
To: ${recipientEmail}
Subject: ${action === "approve" ? "Confirmed: GLITCH FIX Registration" : "Update: GLITCH FIX Payment Rejected"}
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: 7bit

${htmlBody}

${attachmentsBlock}
--${boundary}--`;

    try {
      await sesClient.send(
        new SendRawEmailCommand({
          RawMessage: { Data: Buffer.from(rawEmail) },
        }),
      );
    } catch (emailErr) {
      console.error("SES Error:", emailErr);
      // We don't return error here because the DB update already succeeded
    }
  }

  return NextResponse.json({
    message: `Payment status updated to ${action}`,
    payment: participant.payment,
  });
}
