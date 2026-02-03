import { NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Participant from "@/models/participant.model";

export async function GET() {
  await connect();

  const [stats, registrationsByDate, topColleges] = await Promise.all([
    Participant.aggregate([
      {
        $group: {
          _id: "$payment.status",
          count: { $sum: 1 },
          revenue: { $sum: "$payment.amount" },
        },
      },
    ]),

    Participant.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]),

    Participant.aggregate([
      {
        $group: {
          _id: "$leader.college",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const summary = {
    totalParticipants: stats.reduce((s, x) => s + x.count, 0),
    pendingPayments: stats.find((s) => s._id === "pending")?.count || 0,
    approvedPayments: stats.find((s) => s._id === "approved")?.count || 0,
    rejectedPayments: stats.find((s) => s._id === "rejected")?.count || 0,
    totalRevenue: stats.find((s) => s._id === "approved")?.revenue || 0,
  };

  return NextResponse.json({
    summary,
    registrationsByDate: registrationsByDate.map((d) => ({
      date: d._id,
      count: d.count,
    })),
    participantsByCollege: topColleges.map((c) => ({
      college: c._id,
      count: c.count,
    })),
  });
}
