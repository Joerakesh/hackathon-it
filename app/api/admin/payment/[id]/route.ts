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

  if (action !== "approve" && action !== "reject") {
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

  /* ---------- SES RAW EMAIL ---------- */
  const boundary = "PaymentBoundary123";

  let attachmentsBlock = "";

  if (action === "approve") {
    const rulesPath = path.join(process.cwd(), "public/docs/rules.pdf");
    const schedulePath = path.join(process.cwd(), "public/docs/schedule.pdf");

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

${scheduleBase64}
`;
  }

  const htmlBody =
    action === "approve"
      ? `
        <h2>Payment Approved ✅</h2>
        <p>Hi <strong>${participant.name}</strong>,</p>
        <p>Your payment of <strong>₹${participant.payment.amount}</strong> has been approved.</p>
        <p><strong>Participant ID:</strong> ${participant._id}</p>
        <p>📍 Venue: Sacred Heart College</p>
        <p>📅 Date: February 6</p>
        <p style="color:#991b1b;font-weight:bold;">
          ⚠️ Bring your laptop. No mobile phones allowed.
        </p>
      `
      : `
        <h2>Payment Rejected ❌</h2>
        <p>Hi <strong>${participant.name}</strong>,</p>
        <p>Your payment of <strong>₹${participant.payment.amount}</strong> could not be approved.</p>
        <p>Please contact support if this is a mistake.</p>
      `;

  const rawEmail = `From: ${process.env.AWS_SES_SENDER}
To: ${participant.email}
Subject: ${
    action === "approve"
      ? "Payment Approved – GLITCH FIX Registration Confirmed"
      : "Payment Rejected – GLITCH FIX"
  }
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: 7bit

${htmlBody}
${attachmentsBlock}
--${boundary}--
`;

  await sesClient.send(
    new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail),
      },
    }),
  );

  return NextResponse.json({
    message: `Payment ${action}d successfully`,
    payment: participant.payment,
  });
}
