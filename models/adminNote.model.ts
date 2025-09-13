import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAdminNote extends Document {
  teamId: Types.ObjectId;
  author: string; // Store admin's name/identifier
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNoteSchema: Schema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team", // Reference to the Team model
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // This automatically adds `createdAt` and `updatedAt`
  }
);

export default mongoose.models.AdminNote ||
  mongoose.model<IAdminNote>("AdminNote", AdminNoteSchema);
