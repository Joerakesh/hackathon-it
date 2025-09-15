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
    Calendar,
    Filter,
    X,
} from "lucide-react";
import * as XLSX from "xlsx";

interface TeamData {
    _id: string;
    teamId: string;
    teamLeader: {
        name: string;
        college: string;
        department: string;
        city: string;
        phoneNumber: string;
        email: string;
        teamSize: number;
    };
    teamMembers: {
        _id: string;
        name: string;
        email: string;
        phoneNumber: string;
    }[];
    payment: {
        amount: number;
        status: "pending" | "approved" | "rejected";
        updatedAt: string;
    };
    createdAt: Date;
}

interface AnalyticsData {
    totalTeams: number;
    pendingPayments: number;
    approvedPayments: number;
    rejectedPayments: number;
    totalRevenue: number;
    teamsByDate: { date: string; count: number }[];
    teamsByCollege: { college: string; count: number }[];
}

export default function AnalyticsPage() {
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [collegeFilter, setCollegeFilter] = useState("all");

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/teams");
            const data = await res.json();
            setTeams(data);
            calculateAnalytics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    function normalizeCollegeName(name: string) {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ") // collapse multiple spaces
            .replace(/[\.,']/g, "") // remove dots and apostrophes
            .replace(/\(autonomous\)/gi, "autonomous") // unify brackets
            .replace(/college of women/gi, "college for women") // unify wording
            .replace(/st josephs?/gi, "st joseph's"); // unify variations
    }

    const collegeMap: Record<string, string> = {
        "cauvery college for women autonomous": "Cauvery College for Women (Autonomous)",
        "holy cross college": "Holy Cross College",
        "bishop heber college": "Bishop Heber College",
        "st joseph's college trichy": "St. Joseph's College (Trichy)",
        "valluvar college of science and management": "Valluvar College of Science and Management",
    };

    function cleanCollege(name: string) {
        const key = normalizeCollegeName(name);
        return collegeMap[key] || name.trim();
    }

    const calculateAnalytics = (teamsData: TeamData[]) => {
        // Normalize college names
        // const normalize = (name: string) =>
        //     name.trim().toLowerCase()
        //         .replace(/\s+/g, " ") // collapse multiple spaces
        //         .replace(/autonomous/gi, "Autonomous"); // optional: consistent casing for keywords

        // Calculate teams by date (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        const teamsByDate = last7Days.map(date => ({
            date,
            count: teamsData.filter(team =>
                new Date(team.createdAt).toISOString().split("T")[0] === date
            ).length,
        }));

        // Calculate teams by college (top 10)
        const collegeCount: Record<string, { original: string; count: number }> = {};

        teamsData.forEach(team => {
            const cleanedCollege = cleanCollege(team.teamLeader.college);
            if (!collegeCount[cleanedCollege]) {
                collegeCount[cleanedCollege] = { original: cleanedCollege, count: 0 };
            }
            collegeCount[cleanedCollege].count += 1;
        });


        const teamsByCollege = Object.values(collegeCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(item => ({
                college: item.original,
                count: item.count
            }));

        // Calculate total revenue
        const totalRevenue = teamsData
            .filter(team => team.payment.status === "approved")
            .reduce((sum, team) => sum + team.payment.amount, 0);

        setAnalytics({
            totalTeams: teamsData.length,
            pendingPayments: teamsData.filter(t => t.payment.status === "pending").length,
            approvedPayments: teamsData.filter(t => t.payment.status === "approved").length,
            rejectedPayments: teamsData.filter(t => t.payment.status === "rejected").length,
            totalRevenue,
            teamsByDate,
            teamsByCollege,
        });
    };


    const exportToExcel = () => {
        // Prepare data for export
        const data = teams.map(team => {
            const members = team.teamMembers || [];

            // Flatten member details (up to 3 members since leader is separate)
            const memberData: Record<string, string> = {};
            members.forEach((m, idx) => {
                memberData[`Member${idx + 1} Name`] = m.name;
                memberData[`Member${idx + 1} Email`] = m.email;
                memberData[`Member${idx + 1} Phone`] = m.phoneNumber;
            });

            return {
                TeamID: team.teamId,
                LeaderName: team.teamLeader.name,
                LeaderEmail: team.teamLeader.email,
                LeaderPhone: team.teamLeader.phoneNumber,
                College: cleanCollege(team.teamLeader.college),
                Department: team.teamLeader.department,
                City: team.teamLeader.city,
                "Team Size": team.teamLeader.teamSize,
                "Payment Status": team.payment.status,
                "Payment Amount": team.payment.amount,
                "Registration Date": new Date(team.createdAt).toLocaleDateString(),
                ...memberData // merge member columns dynamically
            };
        });

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Set column widths dynamically
        worksheet['!cols'] = Array.from({ length: 15 }, () => ({ wch: 20 }));

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Teams Data");

        // Generate Excel file and download
        XLSX.writeFile(workbook, `teams_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#0F0F1A] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-300">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#0F0F1A] text-gray-200 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-400">
                                Comprehensive overview of team registrations and payments
                            </p>
                        </div>
                        <Button
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-500 flex items-center gap-2"
                        >
                            <Download size={18} />
                            Export to Excel
                        </Button>
                    </div>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#121218] p-6 rounded-xl border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Users className="text-purple-400" size={20} />
                            </div>
                            <div className="text-gray-400 text-sm">Total Teams</div>
                        </div>
                        <div className="text-2xl font-bold text-white">{analytics?.totalTeams}</div>
                    </div>

                    <div className="bg-[#121218] p-6 rounded-xl border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <CreditCard className="text-yellow-400" size={20} />
                            </div>
                            <div className="text-gray-400 text-sm">Pending Payments</div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">
                            {analytics?.pendingPayments}
                        </div>
                    </div>

                    <div className="bg-[#121218] p-6 rounded-xl border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <TrendingUp className="text-green-400" size={20} />
                            </div>
                            <div className="text-gray-400 text-sm">Approved Payments</div>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                            {analytics?.approvedPayments}
                        </div>
                    </div>

                    <div className="bg-[#121218] p-6 rounded-xl border border-gray-800/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <BarChart3 className="text-blue-400" size={20} />
                            </div>
                            <div className="text-gray-400 text-sm">Total Revenue</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                            ₹{analytics?.totalRevenue}
                        </div>
                    </div>
                </div>

                {/* Charts and Graphs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Registration Trend Chart */}
                    <Card className="bg-[#121218] border-gray-800/50">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Calendar size={18} />
                                Registrations (Last 7 Days)
                            </h3>
                            <div className="h-64">
                                <div className="flex items-end h-48 gap-2 mt-4">
                                    {analytics?.teamsByDate.map((day, index) => (
                                        <div key={index} className="flex flex-col items-center flex-1">
                                            <div
                                                className="w-full bg-purple-500/30 rounded-t-lg transition-all hover:bg-purple-500/50"
                                                style={{ height: `${(day.count / Math.max(...analytics.teamsByDate.map(d => d.count)) || 1) * 100}%` }}
                                            ></div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className="text-sm text-white mt-1">{day.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* College Distribution */}
                    <Card className="bg-[#121218] border-gray-800/50">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Users size={18} />
                                Top Colleges
                            </h3>
                            <div className="space-y-3">
                                {analytics?.teamsByCollege.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="text-gray-300 truncate flex-1 mr-2">
                                            {item.college}
                                        </div>
                                        <div className="flex items-center gap-2 w-24">
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${(item.count / Math.max(...analytics.teamsByCollege.map(c => c.count)) || 1) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-white text-sm w-6">{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table Preview */}
                <Card className="bg-[#121218] border-gray-800/50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">
                                Teams Data Preview
                            </h3>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <select
                                        className="appearance-none text-white bg-[#0D0D12] border border-gray-800 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30"
                                        value={collegeFilter}
                                        onChange={(e) => setCollegeFilter(e.target.value)}
                                    >
                                        <option value="all">All Colleges</option>
                                        {analytics?.teamsByCollege.map((item, index) => (
                                            <option key={index} value={item.college}>
                                                {item.college}
                                            </option>
                                        ))}
                                    </select>
                                    <Filter
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                                        size={16}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Team ID</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Contact</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">College</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams
                                        .filter(team => collegeFilter === "all" || cleanCollege(team.teamLeader.college) === collegeFilter)
                                        .slice(0, 7)
                                        .map((team) => (
                                            <tr key={team._id} className="border-b text-white border-gray-800">
                                                <td className="py-3 px-4 font-mono text-sm">{team.teamId}</td>
                                                <td className="py-3 px-4">{team.teamLeader.name}</td>
                                                <td className="py-3 px-4">{team.teamLeader.phoneNumber}</td>
                                                <td className="py-3 px-4">{team.teamLeader.college}</td>
                                                <td className="py-3 px-4">{team.teamLeader.department}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${team.payment.status === "approved" ? "bg-green-500/20 text-green-300" :
                                                        team.payment.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                                                            "bg-red-500/20 text-red-300"
                                                        }`}>
                                                        {team.payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-center text-gray-500 text-sm">
                            Showing {Math.min(7, teams.length)} of {teams.length} teams
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}