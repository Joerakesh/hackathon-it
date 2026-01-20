import mongoose, { Schema, Types } from "mongoose";

const TeamMemberSchema = new Schema({
  name: String,
  email: String,
  phoneNumber: String,
});

const TeamLeaderSchema = new Schema({
  name: String,
  college: String,
  department: String,
  city: String,
  phoneNumber: String,
  email: String,
  teamSize: Number,
});

const TeamSchema = new Schema(
  {
    teamId: { type: String, required: true, unique: true },

    teamLeader: {
      type: TeamLeaderSchema,
      required: true,
    },

    teamMembers: {
      type: [TeamMemberSchema],
      default: [],
    },

    payment: {
      amount: Number,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      updatedAt: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
