import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/team.model";
import sgMail from "@sendgrid/mail";
import path from "path";
import fs from "fs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Change this
) {
  await connect();

  const { id } = await context.params; // await the promise
  const { action } = await req.json();

  const team = await Team.findById(id);
  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (action === "approve") team.payment.status = "approved";
  if (action === "reject") team.payment.status = "rejected";

  team.payment.updatedAt = new Date();
  await team.save();

  if (action === "approve") {
    // 📂 Resolve PDF file paths inside public/docs
    const rulesPath = path.join(process.cwd(), "public/docs/rules.pdf");
    const schedulePath = path.join(process.cwd(), "public/docs/schedule.pdf");

    // 🔄 Convert to base64
    const rulesFile = fs.readFileSync(rulesPath).toString("base64");
    const scheduleFile = fs.readFileSync(schedulePath).toString("base64");

    await sgMail.send({
      to: team.teamLeader.email,
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject: "✅ Payment Approved – Hackathon 2025 Registration Confirmed",
      text: `Hi ${team.teamLeader.name},\n\nYour payment of ₹${team.payment.amount} has been approved. Your team registration for Hackathon 2025 is confirmed!\n\nTeam ID: ${team.teamId}\n\nFor support,⚠️ Important: Students must bring their laptop. visit https://jwstechnologies.com`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0;">
          <div style="text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #111827; margin: 0;">✅ Payment Approved!</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 6px 0 0;">Hackathon 2025 • St. Joseph’s College</p>
          </div>

          <div style="color: #111827; font-size: 15px; line-height: 1.6;">
            <p>Hi <strong>${team.teamLeader.name}</strong>,</p>
            <p>Your payment of <strong>₹${
              team.payment.amount
            }</strong> has been successfully approved. Your team registration for Hackathon 2025 is now confirmed 🚀</p>

            <p style="background-color: #d1fae5; color: #065f46; padding: 10px 15px; border-radius: 8px; font-weight: bold;">
              ✅ Payment Status: Approved
            </p>

            <h3>👥 Team Details</h3>
            <ul>
              <li><strong>Team ID:</strong> ${team.teamId}</li>
              <li><strong>Leader:</strong> ${team.teamLeader.name}, ${
        team.teamLeader.college
      }, ${team.teamLeader.city}, ${team.teamLeader.phoneNumber}, ${
        team.teamLeader.email
      }</li>
              ${team.teamMembers
                .map(
                  (m, i) =>
                    `<li><strong>Member ${i + 1}:</strong> ${m.name}, ${
                      m.email
                    }, ${m.phoneNumber}</li>`
                )
                .join("")}
            </ul>

            <p>📅 Event Date: 16th September 2025<br/>
            ⏰ Reporting Time: Before 8:45 AM<br/>
            📍 Venue: Sail Hall, St. Joseph’s College</p>

    <p style="background-color:#fef2f2; color:#991b1b; padding:10px 15px; border-radius:8px; font-weight:bold;">
        ⚠️ Important: Students must bring their laptop.
      </p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://hackathon.jwstechnologies.com/login" 
                style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Login to Dashboard
              </a>
            </div>

            <p>For support, call: <a href="tel:+916385266784" style="color:#2563eb; text-decoration:none;">+91 6385266784</a> or visit <a href="https://jwstechnologies.com" style="color:#2563eb; text-decoration:none;">jwstechnologies.com</a></p>
          </div>

          <div style="text-align: center; padding: 15px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px; margin-top: 20px;">
            © 2025 Hackathon Team | <a href="https://jwstechnologies.com" target="_blank" style="color: #2563eb; text-decoration: none;">JWS Technologies – Technical Support</a>
          </div>
        </div>
        `,
      attachments: [
        {
          content: rulesFile,
          filename: "rules.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
        {
          content: scheduleFile,
          filename: "schedule.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  }

  if (action === "reject") {
    await sgMail.send({
      to: team.teamLeader.email,
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject: "❌ Payment Rejected – Hackathon 2025 Registration Update",
      text: `Hi ${team.teamLeader.name},\n\n⚠️ Please do not make any further payments.\n\nWe regret to inform you that your payment of ₹${team.payment.amount} could not be approved. As a result, your team registration for Hackathon 2025 has not been confirmed.\n\nIf you believe this is a mistake or need further clarification, kindly reach out to our support team at +91 6385266784.\n\nThank you for your interest, and we encourage you to participate in our future events.\n\n– Hackathon 2025 Organizing Team`,
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0;">
      <div style="text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #b91c1c; margin: 0;">❌ Payment Rejected</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 6px 0 0;">Hackathon 2025 • St. Joseph’s College</p>
      </div>

      <div style="color: #111827; font-size: 15px; line-height: 1.6;">
        <p style="background-color:#fef2f2; color:#991b1b; padding:10px 15px; border-radius:8px; font-weight:bold; text-align:center;">
          ⚠️ Please do not make any further payments.
        </p>

        <p>Hi <strong>${team.teamLeader.name}</strong>,</p>
        <p>We regret to inform you that your payment of <strong>₹${team.payment.amount}</strong> could not be approved. As a result, your team registration for Hackathon 2025 has not been confirmed.</p>

        <p style="background-color: #fee2e2; color: #991b1b; padding: 10px 15px; border-radius: 8px; font-weight: bold;">
          ❌ Payment Status: Rejected
        </p>

        <p>If you believe this is a mistake or have any questions, please contact our support team at <a href="tel:+916385266784" style="color:#2563eb; text-decoration:none;">+91 6385266784</a>.</p>

        <p>Thank you for your interest, and we encourage you to participate in our upcoming events.</p>

        <div style="text-align: center; padding: 15px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px; margin-top: 20px;">
          © 2025 Hackathon Team | <a href="https://jwstechnologies.com" target="_blank" style="color: #2563eb; text-decoration: none;">JWS Technologies – Technical Support</a>
        </div>
      </div>
    </div>
    `,
    });
  }

  return NextResponse.json({
    message: `Payment ${action}d successfully`,
    payment: team.payment,
  });
}
