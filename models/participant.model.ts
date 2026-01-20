import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

/* ------------------ TYPES ------------------ */

export interface ParticipantDocument extends Document {
  name: string;
  college: string;
  department: string;
  city: string;
  phoneNumber: string;
  email: string;
  password: string;

  event: "GLITCH FIX";
  participationType: "Individual";
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

/* ------------------ SCHEMAS ------------------ */

const PaymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      default: 250,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ParticipantSchema = new Schema<ParticipantDocument>(
  {
    name: { type: String, required: true, trim: true },

    college: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: { type: String, required: true, trim: true },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔒 never returned by default
    },

    event: {
      type: String,
      default: "GLITCH FIX",
      immutable: true,
    },

    participationType: {
      type: String,
      default: "Individual",
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

// Hash password before save
ParticipantSchema.pre("save", async function (next) {
  const user = this as ParticipantDocument;

  if (!user.isModified("password")) return next();

  user.password = await bcrypt.hash(user.password, 10);
  next();
});

/* ------------------ METHODS ------------------ */

ParticipantSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

/* ------------------ MODEL ------------------ */

const Participant: Model<ParticipantDocument> =
  mongoose.models.Participant ||
  mongoose.model<ParticipantDocument>("Participant", ParticipantSchema);

export default Participant;
