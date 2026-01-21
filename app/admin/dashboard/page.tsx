"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Trash2,
    Search,
    Filter,
} from "lucide-react";

interface ParticipantData {
    _id: string;
    name: string;
    college: string;
    department: string;
    city: string;
    phoneNumber: string;
    email: string;
    role: "participant" | "admin";
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
    const [statusFilter, setStatusFilter] =
        useState<"all" | "pending" | "approved" | "rejected">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/participants");
            const data = await res.json();
            setParticipants(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
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
                    p.name.toLowerCase().includes(t) ||
                    p.email.toLowerCase().includes(t) ||
                    p.phoneNumber.includes(t) ||
                    p.college.toLowerCase().includes(t),
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((p) => p.payment.status === statusFilter);
        }

        setFiltered(result);
    }, [search, statusFilter, participants]);

    const handlePayment = async (
        id: string,
        action: "approve" | "reject" | "pending",
    ) => {
        setActionLoading(id);
        try {
            await fetch(`/api/admin/payment/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            fetchParticipants();
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this participant?")) return;
        await fetch(`/api/admin/participants/${id}`, { method: "DELETE" });
        fetchParticipants();
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500/20 text-yellow-300";
            case "approved":
                return "bg-green-500/20 text-green-300";
            case "rejected":
                return "bg-red-500/20 text-red-300";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading participants…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-6 text-gray-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold text-white">
                        Participant Administration
                    </h1>
                    <p className="text-gray-400">
                        Manage registrations and payment status
                    </p>
                </header>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded bg-[#121218] border border-gray-700"
                            placeholder="Search name, email, phone, college…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <select
                            className="bg-[#121218] border border-gray-700 rounded py-2 px-4 pr-10"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as any)
                            }
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <Filter
                            className="absolute right-3 top-3 text-gray-500"
                            size={16}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filtered.map((p) => (
                        <Card key={p._id} className="bg-[#121218] border-gray-800">
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <User size={16} /> {p.name}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        {p.college} · {p.department}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <Mail size={14} /> {p.email}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <Phone size={14} /> {p.phoneNumber}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <MapPin size={14} /> {p.city}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <span
                                        className={`px-3 py-1 text-xs rounded ${statusBadge(
                                            p.payment.status,
                                        )}`}
                                    >
                                        {p.payment.status.toUpperCase()}
                                    </span>

                                    <div className="text-sm text-gray-300">
                                        ₹{p.payment.amount}
                                    </div>

                                    <div className="flex gap-2">
                                        {p.payment.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600"
                                                    disabled={actionLoading === p._id}
                                                    onClick={() => handlePayment(p._id, "approve")}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600"
                                                    disabled={actionLoading === p._id}
                                                    onClick={() => handlePayment(p._id, "reject")}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}

                                        {p.payment.status !== "pending" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                                                disabled={actionLoading === p._id}
                                                onClick={() => handlePayment(p._id, "pending")}
                                            >
                                                Set Pending
                                            </Button>
                                        )}
                                    </div>


                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-red-400"
                                        onClick={() => handleDelete(p._id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filtered.length === 0 && (
                        <p className="text-center text-gray-500 py-12">
                            No participants found
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
