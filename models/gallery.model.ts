import mongoose, { Schema, Document } from "mongoose";

interface Gallery extends Document {
  teamId: string; // Reference to Team.teamId
  images: string[]; // URLs of uploaded images
  folderUrl?: string; // Google Drive / S3 / Cloudinary folder link
  createdAt: Date;
}

const GallerySchema = new Schema<Gallery>({
  teamId: { type: String, required: true, ref: "Team" }, // 🔗 Linking via teamId
  images: [{ type: String }],
  folderUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Gallery ||
  mongoose.model<Gallery>("Gallery", GallerySchema);
