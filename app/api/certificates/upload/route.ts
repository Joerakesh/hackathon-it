import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";
import Certificate from "@/models/certificate.model";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    await connect();

    const formData = await req.formData();
    const participantId = formData.get("participantId") as string;
    const file = formData.get("file") as File;

    if (!participantId || !file) {
      return NextResponse.json(
        { error: "Missing participantId or file" },
        { status: 400 },
      );
    }

    /* ---------- Find participant ---------- */
    const participant = await Participant.findById(participantId).lean();

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    /* ---------- Save file ---------- */
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = path.extname(file.name || ".pdf");
    const fileName = `${uuidv4()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "certificates");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    /* ---------- Save certificate record ---------- */
    const certificate = await Certificate.create({
      certificateId: uuidv4(),
      participantId: participant._id,
      studentName: participant.name,
      email: participant.email,
      fileUrl: `/certificates/${fileName}`,
      issuedAt: new Date(),
    });

    return NextResponse.json(certificate);
  } catch (err) {
    console.error("Certificate upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
