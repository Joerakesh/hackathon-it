// app/api/admin/participants/[id]/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connect();

    const { id } = await context.params;

    const participant = await Participant.findByIdAndDelete(id);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Participant ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete participant error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during deletion" },
      { status: 500 },
    );
  }
}
