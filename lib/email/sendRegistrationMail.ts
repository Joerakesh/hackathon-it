import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface RegistrationMailParams {
  to: string;
  name: string;
  participantId: string;
  qrBase64: string;
}

/* ---- Helper: wrap base64 at 76 chars ---- */
function wrapBase64(base64: string): string {
  return base64.match(/.{1,76}/g)?.join("\r\n") ?? base64;
}

export async function sendRegistrationMail({
  to,
  name,
  participantId,
  qrBase64,
}: RegistrationMailParams) {
  const boundary = "NextJSBoundary123";
  const wrappedQR = wrapBase64(qrBase64);

  const subject = "✅ GLITCH FIX Registration Confirmed – Rules & Payment";
  const encodedSubject = Buffer.from(subject).toString("base64");

  const rawEmail = `From: ${process.env.AWS_SES_SENDER}
To: ${to}
Subject: =?UTF-8?B?${encodedSubject}?=
MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: 7bit

<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width:620px; margin:auto; color:#111827;">

  <h2>GLITCH FIX – Registration Confirmed</h2>

  <p>Hi <strong>${name}</strong>,</p>

  <p>
    Your registration for <strong>GLITCH FIX</strong> has been successfully confirmed.
    Please complete the payment to finalize your participation.
  </p>

  <div style="background:#fef3c7;padding:14px;border-radius:8px;margin:16px 0;">
    <strong>Payment Pending:</strong> ₹250<br/>
    <strong>UPI ID:</strong> 7094594221@naviaxis<br/>
    <strong>Transaction Note:</strong> ${participantId}
  </div>

  <p style="text-align:center;margin:20px 0;">
    <img src="cid:qrCodeImage" width="200" />
  </p>

  <h3>📌 Event Details</h3>
  <p>
    📅 <strong>Date:</strong> February 6<br/>
    📍 <strong>Venue:</strong> Sacred Heart College (Autonomous)
  </p>

  <h3>📜 Rules & Regulations</h3>
  <ul style="line-height:1.6;">
    <li>Participants are allowed to use <strong>laptops and mobile phones</strong>.</li>
    <li>Participants must bring their <strong>own chargers</strong> and ensure sufficient battery backup.</li>
    <li><strong>Internet access is mandatory</strong> for participation.</li>
    <li>The organizers will <strong>NOT provide internet connectivity</strong>.</li>
    <li>Participants are solely responsible for arranging and bearing the cost of their own internet access (mobile data, hotspot, etc.).</li>
    <li><strong>Use of AI tools</strong> (ChatGPT, Copilot, Gemini, etc.) is strictly prohibited.</li>
    <li>Copying or pasting from any external source is not allowed.</li>
    <li>Participants must remain in <strong>full-screen mode</strong>; switching tabs or exiting full screen counts as a violation.</li>
    <li>Each prohibited action counts as <strong>one violation</strong>.</li>
    <li><strong>Accumulating 10 violations results in immediate disqualification</strong>.</li>
    <li>Any form of malpractice leads to immediate disqualification.</li>
    <li>Judges’ and organizers’ decisions are <strong>final and binding</strong>.</li>
  </ul>

  <p style="color:#991b1b;font-weight:bold;">
    ⚠️ Violation of any rules may result in disqualification without prior warning.
  </p>

  <p>
    — Department of Computer Science<br/>
    Sacred Heart College (Autonomous)
  </p>

</body>
</html>

--${boundary}
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-ID: <qrCodeImage>
Content-Disposition: inline; filename="qr.png"

${wrappedQR}

--${boundary}--`;

  try {
    await sesClient.send(
      new SendRawEmailCommand({
        RawMessage: {
          Data: Buffer.from(rawEmail, "utf-8"),
        },
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("❌ SES RawEmail error:", error);
    return { success: false };
  }
}
