import mongoose, { Schema, Document, Model } from "mongoose";

export interface CertificateDocument extends Document {
  certificateId: string;
  teamId: string; // 🔗 Reference to Team
  memberId: string; // 🔗 Reference to TeamMember (_id)
  studentName: string;
  email: string;
  fileUrl: string; // path to certificate image/pdf
  issuedAt: Date;
}

const CertificateSchema = new Schema<CertificateDocument>(
  {
    certificateId: { type: String, required: true, unique: true },
    teamId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    fileUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Certificate: Model<CertificateDocument> =
  mongoose.models.Certificate ||
  mongoose.model<CertificateDocument>("Certificate", CertificateSchema);

export default Certificate;
