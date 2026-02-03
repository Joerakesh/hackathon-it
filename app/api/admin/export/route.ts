import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";
import * as XLSX from "xlsx";

export async function GET() {
  await connect();

  const participants = await Participant.find()
    .select(
      "participantId leader member payment createdAt event participationType",
    )
    .lean();

  const rows = participants.map((p: any) => ({
    "Participant ID": p.participantId,
    Event: p.event,
    Type: p.participationType,

    "Leader Name": p.leader?.name,
    "Leader Email": p.leader?.email,
    "Leader Phone": p.leader?.phoneNumber,
    College: p.leader?.college,
    Department: p.leader?.department,
    City: p.leader?.city,

    "Member Name": p.member?.name || "",
    "Member Email": p.member?.email || "",
    "Member Phone": p.member?.phoneNumber || "",

    "Payment Status": p.payment?.status,
    Amount: p.payment?.amount,
    "Registered At": new Date(p.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="participants.xlsx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
