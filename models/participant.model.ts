import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./counter.model";

/* ------------------ TYPES ------------------ */

export interface TeamMember {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface Leader extends TeamMember {
  college: string;
  department: string;
  city: string;
  password: string;
}

export interface ParticipantDocument extends Document {
  participantId: string;

  leader: Leader;
  member: TeamMember;

  event: "GLITCH FIX";
  participationType: "Team";
  role: "participant" | "admin";

  payment: {
    amount: number;
    status: "pending" | "approved" | "rejected";
    updatedAt: Date;
  };

  comparePassword(candidate: string): Promise<boolean>;

  createdAt: Date;
  updatedAt: Date;
}

/* ------------------ SUB SCHEMAS ------------------ */

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { _id: false },
);

const LeaderSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },

    phoneNumber: { type: String, required: true, unique: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true, select: false },
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

/* ------------------ MAIN SCHEMA ------------------ */

const ParticipantSchema = new Schema<ParticipantDocument>(
  {
    participantId: {
      type: String,
      unique: true,
      index: true,
    },

    leader: {
      type: LeaderSchema,
      required: true,
    },

    member: {
      type: TeamMemberSchema,
      required: false,
    },

    event: {
      type: String,
      default: "GLITCH FIX",
      immutable: true,
    },

    participationType: {
      type: String,
      enum: ["Team"],
      default: "Team",
      immutable: true,
    },

    role: {
      type: String,
      enum: ["participant", "admin"],
      default: "participant",
    },

    payment: {
      type: PaymentSchema,
      required: true,
    },
  },
  { timestamps: true },
);

/* ------------------ MIDDLEWARE ------------------ */

// 🔐 Auto participantId + hash leader password
ParticipantSchema.pre("save", async function (next) {
  const doc = this as ParticipantDocument;

  // Generate participantId
  if (doc.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "participant" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    doc.participantId = `SHCCSGF${String(counter.seq).padStart(3, "0")}`;
  }

  // Hash leader password only
  if (!doc.isModified("leader.password")) return next();

  doc.leader.password = await bcrypt.hash(doc.leader.password, 10);
  next();
});

/* ------------------ METHODS ------------------ */

ParticipantSchema.methods.comparePassword = function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.leader.password);
};

/* ------------------ MODEL ------------------ */

const Participant: Model<ParticipantDocument> =
  mongoose.models.Participant ||
  mongoose.model<ParticipantDocument>("Participant", ParticipantSchema);

export default Participant;
