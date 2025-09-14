import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Team from "@/models/team.model";
import Certificate from "@/models/certificate.model";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connect();

    const formData = await req.formData();
    const teamId = formData.get("teamId") as string;
    const memberId = formData.get("memberId") as string;
    const file = formData.get("file") as Blob & { name: string };
    // Use 'File' type from Web API

    if (!teamId || !memberId || !file) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    interface TeamMember {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
      phoneNumber: string;
    }

    interface TeamLeader {
      _id: mongoose.Types.ObjectId;
      name: string;
      college: string;
      department: string;
      city: string;
      phoneNumber: string;
      email: string;
      password: string;
      teamSize: number;
    }

    const team = await Team.findOne({ teamId }).lean();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if member is leader or part of team members
    const member =
      team.teamLeader &&
      (team.teamLeader as TeamLeader)._id.toString() === memberId
        ? (team.teamLeader as TeamLeader)
        : (team.teamMembers as TeamMember[]).find(
            (m: TeamMember) => m._id.toString() === memberId
          );

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in team" },
        { status: 404 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = path.extname(file.name || ""); // fallback if name missing
    const fileName = `${uuidv4()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "certificates");

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const certificate = await Certificate.create({
      certificateId: uuidv4(),
      teamId, // <--- add this
      memberId,
      studentName: member.name,
      email: member.email,
      fileUrl: `/certificates/${fileName}`,
      issuedAt: new Date(),
    });

    return NextResponse.json(certificate);
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
