"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Phone,
    Mail,
    MapPin,
    Trash2,
    Search,
    Users,
} from "lucide-react";

/* ================= UPDATED TYPES ================= */

interface ParticipantData {
    _id: string;
    participantId: string;
    event: string;
    participationType: string;
    leader: {
        name: string;
        college: string;
        department: string;
        city: string;
        phoneNumber: string;
        email: string;
    };
    member?: {
        name: string;
        phoneNumber: string;
        email: string;
    };
    payment: {
        amount: number;
        status: "pending" | "approved" | "rejected";
        updatedAt: string;
    };
    createdAt: string;
}

export default function AdminDashboard() {
    const [participants, setParticipants] = useState<ParticipantData[]>([]);
    const [filtered, setFiltered] = useState<ParticipantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/participants");
            const data = await res.json();
            // Ensure data is an array before setting
            const safeData = Array.isArray(data) ? data : [];
            setParticipants(safeData);
            setFiltered(safeData);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    useEffect(() => {
        let result = participants;

        if (search) {
            const t = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.leader?.name?.toLowerCase().includes(t) ||
                    p.leader?.email?.toLowerCase().includes(t) ||
                    p.participantId?.toLowerCase().includes(t) ||
                    p.leader?.college?.toLowerCase().includes(t) ||
                    p.member?.name?.toLowerCase().includes(t)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((p) => p.payment?.status === statusFilter);
        }

        setFiltered(result);
    }, [search, statusFilter, participants]);

    const handlePayment = async (id: string, action: "approve" | "reject" | "pending") => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/payment/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) fetchParticipants();
        } catch (err) {
            console.error("Payment Update Error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this participant permanently?")) return;
        try {
            const res = await fetch(`/api/admin/participants/${id}`, { method: "DELETE" });
            if (res.ok) fetchParticipants();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const statusStyles = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        approved: "bg-green-500/10 text-green-500 border-green-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] text-purple-500">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500 mb-4"></div>
                <p className="font-mono text-sm uppercase tracking-widest">Accessing Records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-6 text-gray-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Console</h1>
                        <p className="text-gray-500 text-sm">Managing {participants.length} total registrations</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#121218] p-4 rounded-xl border border-white/5 shadow-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-purple-500 outline-none transition-all text-sm"
                            placeholder="Search name, ID, or college..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="bg-black/40 border border-white/10 rounded-lg py-2 px-4 text-sm outline-none focus:border-purple-500 appearance-none min-w-[150px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {filtered.map((p) => (
                        <Card key={p._id} className="bg-[#121218] border-white/5 hover:border-white/10 transition-colors shadow-lg overflow-hidden">
                            <CardContent className="p-5 flex flex-col lg:flex-row justify-between gap-6">

                                {/* Left: Participant Details */}
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="font-mono text-[10px] text-purple-400 border-purple-400/20">
                                            {p.participantId || "NO-ID"}
                                        </Badge>
                                        <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest">
                                            {p.participationType || "TEAM"}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Leader Info */}
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase text-purple-500/80 font-bold">Leader</p>
                                            <h2 className="text-lg font-bold text-white leading-none">
                                                {p.leader?.name || "Missing Name"}
                                            </h2>
                                            <div className="flex flex-col text-xs text-gray-400 pt-1 space-y-0.5">
                                                <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-600" /> {p.leader?.email}</span>
                                                <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-600" /> {p.leader?.phoneNumber}</span>
                                            </div>
                                        </div>

                                        {/* Member Info */}
                                        {p.member?.name && (
                                            <div className="space-y-1 border-l border-white/5 pl-4">
                                                <p className="text-[10px] uppercase text-gray-500 font-bold">Partner</p>
                                                <h2 className="text-lg font-medium text-gray-300 leading-none">{p.member.name}</h2>
                                                <div className="flex flex-col text-xs text-gray-500 pt-1">
                                                    <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-600" /> {p.member.email}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-[11px] text-gray-500 border-t border-white/5 pt-2 font-medium">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {p.leader?.city}</span>
                                        <span className="flex items-center gap-1"><Users size={12} /> {p.leader?.college}</span>
                                        <span className="text-purple-400/80 italic">{p.leader?.department}</span>
                                    </div>
                                </div>

                                {/* Right: Payment Actions */}
                                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:min-w-[220px] border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white tracking-tighter">₹{p.payment?.amount || 0}</p>
                                        <Badge className={`mt-1 font-bold tracking-widest text-[10px] border ${statusStyles[p.payment?.status as keyof typeof statusStyles]}`}>
                                            {p.payment?.status?.toUpperCase() || "UNKNOWN"}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        {p.payment?.status === "pending" ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs px-4"
                                                    disabled={actionLoading === p._id}
                                                    onClick={() => handlePayment(p._id, "approve")}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 text-xs px-4"
                                                    disabled={actionLoading === p._id}
                                                    onClick={() => handlePayment(p._id, "reject")}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-white/10 text-gray-400 hover:text-white h-8 text-xs"
                                                disabled={actionLoading === p._id}
                                                onClick={() => handlePayment(p._id, "pending")}
                                            >
                                                Set Pending
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-gray-600 hover:text-red-500 h-8 w-8"
                                            onClick={() => handleDelete(p._id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-[#121218] rounded-xl border border-dashed border-white/10">
                            <Search className="mx-auto text-gray-700 mb-4" size={48} />
                            <p className="text-gray-500 font-mono">No matching records found in the database.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}