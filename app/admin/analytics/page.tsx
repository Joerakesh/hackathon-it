"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    Users,
    CreditCard,
    TrendingUp,
    BarChart3,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface AnalyticsResponse {
    summary: {
        totalParticipants: number;
        pendingPayments: number;
        approvedPayments: number;
        rejectedPayments: number;
        totalRevenue: number;
    };
    registrationsByDate: { date: string; count: number }[];
    participantsByCollege: { college: string; count: number }[];
}

/* ---------------- PAGE ---------------- */

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then((res) => res.json())
            .then(setAnalytics)
            .catch((err) => console.error("Analytics fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    const exportExcel = () => {
        // IMPORTANT: do NOT generate large Excel files in browser
        // This should hit an API that streams XLSX
        window.location.href = "/api/admin/export";
    };

    if (loading || !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] text-gray-400">
                Loading analytics…
            </div>
        );
    }

    const { summary, registrationsByDate, participantsByCollege } = analytics;

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-6 text-gray-200">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Real-time registration & payment insights
                        </p>
                    </div>

                    <Button
                        onClick={exportExcel}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Download size={16} className="mr-2" />
                        Export Excel
                    </Button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat
                        icon={Users}
                        label="Participants"
                        value={summary.totalParticipants}
                    />
                    <Stat
                        icon={CreditCard}
                        label="Pending"
                        value={summary.pendingPayments}
                    />
                    <Stat
                        icon={TrendingUp}
                        label="Approved"
                        value={summary.approvedPayments}
                    />
                    <Stat
                        icon={BarChart3}
                        label="Revenue"
                        value={`₹${summary.totalRevenue}`}
                    />
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                    <SimpleBarChart
                        title="Registrations (Last 7 Days)"
                        data={registrationsByDate}
                        labelKey="date"
                    />
                    <SimpleBarChart
                        title="Top Colleges"
                        data={participantsByCollege}
                        labelKey="college"
                    />
                </div>
            </div>
        </div>
    );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: number | string;
}) {
    return (
        <Card className="bg-[#121218] border-white/5">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon size={16} />
                    {label}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}

function SimpleBarChart({
    title,
    data,
    labelKey,
}: {
    title: string;
    data: any[];
    labelKey: string;
}) {
    const max = Math.max(...data.map((d) => d.count), 1);

    return (
        <Card className="bg-[#121218] border-white/5">
            <CardContent className="p-4">
                <h3 className="text-white mb-4">{title}</h3>

                <div className="flex items-end h-40 gap-2">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 text-center">
                            <div
                                className="bg-purple-500/40 rounded-t"
                                style={{ height: `${(d.count / max) * 100}%` }}
                            />
                            <div className="text-[10px] text-gray-500 mt-1 truncate">
                                {d[labelKey]}
                            </div>
                            <div className="text-xs text-gray-400">
                                {d.count}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
