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

export async function sendRegistrationMail({
  to,
  name,
  participantId,
  qrBase64,
}: RegistrationMailParams) {
  const boundary = "NextJSBoundary123";
  console.log(qrBase64);
  const rawEmail = `
From: ${process.env.AWS_SES_SENDER}
To: ${to}
Subject: =?UTF-8?B?${Buffer.from(
    "✅ GLITCH FIX Registration Confirmed – Payment Pending",
  ).toString("base64")}?=
MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: 7bit

<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width:620px; margin:auto;">
  <h2>GLITCH FIX – Registration Confirmed</h2>

  <p>Hi <strong>${name}</strong>,</p>

  <p>Your registration for <strong>GLITCH FIX</strong> has been confirmed.</p>

  <div style="background:#fef3c7;padding:12px;border-radius:8px;">
    <strong>Payment Pending: ₹250</strong>
  </div>

  <p><strong>UPI ID:</strong> rakeshjoe52@oksbi</p>
  <p><strong>Transaction Note:</strong> ${participantId}</p>

  <p style="text-align:center;margin:20px 0;">
    <img src="cid:qrCodeImage" width="200" />
  </p>

  <p>
    📅 <strong>Date:</strong> February 6<br/>
    📍 <strong>Venue:</strong> Sacred Heart College (Autonomous)
  </p>

  <p style="color:#991b1b;font-weight:bold;">
    ⚠️ No Internet / Mobile Phones / Smart Watches allowed.
  </p>

  <p>— Department of Computer Science<br/>Sacred Heart College</p>
</body>
</html>

--${boundary}
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-ID: <qrCodeImage>
Content-Disposition: inline; filename="qr.png"

${qrBase64}

--${boundary}--
`;

  try {
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail),
      },
    });

    await sesClient.send(command);
    return { success: true };
  } catch (error) {
    console.error("❌ SES RawEmail error:", error);
    return { success: false };
  }
}
