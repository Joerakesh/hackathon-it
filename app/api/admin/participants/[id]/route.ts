// app/api/admin/participants/[id]/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connect();

  const { id } = await context.params; // ✅ unwrap params

  await Participant.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
