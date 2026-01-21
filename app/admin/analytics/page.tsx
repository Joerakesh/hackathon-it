"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    Users,
    CreditCard,
    TrendingUp,
    BarChart3,
    Calendar,
    Filter,
} from "lucide-react";
import * as XLSX from "xlsx";

interface ParticipantData {
    _id: string;
    name: string;
    college: string;
    department: string;
    city: string;
    phoneNumber: string;
    email: string;
    payment: {
        amount: number;
        status: "pending" | "approved" | "rejected";
        updatedAt: string;
    };
    createdAt: string;
    participantId: string;
}

interface AnalyticsData {
    totalParticipants: number;
    pendingPayments: number;
    approvedPayments: number;
    rejectedPayments: number;
    totalRevenue: number;
    registrationsByDate: { date: string; count: number }[];
    participantsByCollege: { college: string; count: number }[];
}

export default function AnalyticsPage() {
    const [participants, setParticipants] = useState<ParticipantData[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [collegeFilter, setCollegeFilter] = useState("all");

    const fetchParticipants = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/participants");
            const data: ParticipantData[] = await res.json();
            setParticipants(data);
            calculateAnalytics(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParticipants();
    }, [fetchParticipants]);

    const calculateAnalytics = (data: ParticipantData[]) => {
        // Last 7 days
        const days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        const registrationsByDate = days.map(date => ({
            date,
            count: data.filter(p =>
                p.createdAt.startsWith(date)
            ).length,
        }));

        const collegeCount: Record<string, number> = {};
        data.forEach(p => {
            const key = p.college.trim();
            collegeCount[key] = (collegeCount[key] || 0) + 1;
        });

        const participantsByCollege = Object.entries(collegeCount)
            .map(([college, count]) => ({ college, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const totalRevenue = data
            .filter(p => p.payment.status === "approved")
            .reduce((sum, p) => sum + p.payment.amount, 0);

        setAnalytics({
            totalParticipants: data.length,
            pendingPayments: data.filter(p => p.payment.status === "pending").length,
            approvedPayments: data.filter(p => p.payment.status === "approved").length,
            rejectedPayments: data.filter(p => p.payment.status === "rejected").length,
            totalRevenue,
            registrationsByDate,
            participantsByCollege,
        });
    };

    const exportToExcel = () => {
        const rows = participants.map(p => ({
            ID: p.participantId,
            Name: p.name,
            Email: p.email,
            Phone: p.phoneNumber,
            College: p.college,
            Department: p.department,
            City: p.city,
            "Payment Status": p.payment.status,
            Amount: p.payment.amount,
            "Registered On": new Date(p.createdAt).toLocaleDateString(),
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Participants");
        XLSX.writeFile(wb, "participants.xlsx");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-6 text-gray-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <Button onClick={exportToExcel} className="bg-green-600">
                        <Download size={16} /> Export
                    </Button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat icon={Users} label="Participants" value={analytics?.totalParticipants} />
                    <Stat icon={CreditCard} label="Pending" value={analytics?.pendingPayments} />
                    <Stat icon={TrendingUp} label="Approved" value={analytics?.approvedPayments} />
                    <Stat icon={BarChart3} label="Revenue" value={`₹${analytics?.totalRevenue}`} />
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                    <SimpleBarChart title="Registrations (7 days)" data={analytics!.registrationsByDate} />
                    <SimpleBarChart title="Top Colleges" data={analytics!.participantsByCollege} />
                </div>
            </div>
        </div>
    );
}

/* ---------- Small helpers ---------- */

function Stat({ icon: Icon, label, value }: any) {
    return (
        <Card className="bg-[#121218] border-gray-800">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-400">
                    <Icon size={16} /> {label}
                </div>
                <div className="text-2xl text-white font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function SimpleBarChart({ title, data }: any) {
    const max = Math.max(...data.map((d: any) => d.count), 1);
    return (
        <Card className="bg-[#121218] border-gray-800">
            <CardContent className="p-4">
                <h3 className="text-white mb-3">{title}</h3>
                <div className="flex items-end h-40 gap-2">
                    {data.map((d: any, i: number) => (
                        <div key={i} className="flex-1 text-center">
                            <div
                                className="bg-purple-500/40 rounded-t"
                                style={{ height: `${(d.count / max) * 100}%` }}
                            />
                            <div className="text-xs text-gray-400">{d.count}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
