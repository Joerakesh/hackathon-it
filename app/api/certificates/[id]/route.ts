import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Certificate from "@/models/certificate.model";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await context.params;
  const cert = await Certificate.findOne({ certificateId: id });

  if (!cert) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(cert);
}
