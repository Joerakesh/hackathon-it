"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    MapPin,
    Phone,
    Mail,
    Pencil,
    Trash2,
    Users,
    CreditCard,
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

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
    teamMembers: TeamMember[];
    payment: {
        amount: number;
        status: "pending" | "approved" | "rejected";
        updatedAt: string;
    };
    createdAt: Date;
}
// Add this interface (if not importing from a shared types file)
interface AdminNote {
    _id: string;
    author: string;
    content: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<TeamData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editingTeam, setEditingTeam] = useState<TeamData | null>(null);
    const [formData, setFormData] = useState<TeamData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "pending" | "approved" | "rejected"
    >("all");
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());


    // Add this state to manage notes for the currently expanded team
    const [teamNotes, setTeamNotes] = useState<Record<string, AdminNote[]>>({});
    const [newNoteContent, setNewNoteContent] = useState('');

    // Preload form when opening edit
    useEffect(() => {
        if (editingTeam) {
            setFormData(editingTeam);
        }
    }, [editingTeam]);

    // Filter teams based on search and status
    useEffect(() => {
        let result = teams;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (team) =>
                    team.teamLeader.name.toLowerCase().includes(term) ||
                    team.teamId.toLowerCase().includes(term) ||
                    team.teamLeader.email.toLowerCase().includes(term) ||
                    team.teamLeader.phoneNumber.includes(term) ||
                    team.teamMembers.some(
                        (member) =>
                            member.name.toLowerCase().includes(term) ||
                            member.email.toLowerCase().includes(term)
                    )
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((team) => team.payment.status === statusFilter);
        }

        setFilteredTeams(result);
    }, [teams, searchTerm, statusFilter]);
    const fetchNotesForTeam = async (teamId: string) => {
        // Don't re-fetch if we already have the notes
        if (teamNotes[teamId]) return;

        try {
            const res = await fetch(`/api/admin/teams/${teamId}/notes`);
            if (res.ok) {
                const notes = await res.json();
                setTeamNotes(prev => ({ ...prev, [teamId]: notes }));
            }
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        }
    };
    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/teams");
            const data = await res.json();
            setTeams(data);
            setFilteredTeams(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleSaveEdit = async () => {
        if (!editingTeam || !formData) return;

        try {
            const res = await fetch(`/api/admin/teams/${editingTeam._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await fetchTeams();
                setEditingTeam(null);
            } else {
                console.error("Failed to update team");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayment = async (
        teamId: string,
        action: "approve" | "reject"
    ) => {
        setActionLoading(teamId);
        try {
            const res = await fetch(`/api/admin/payment/${teamId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) fetchTeams();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (teamId: string) => {
        if (!confirm("Are you sure you want to delete this team?")) return;

        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await fetchTeams();
            } else {
                console.error("Failed to delete team");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTeamExpansion = async (teamId: string) => {
        const newExpanded = new Set(expandedTeams);
        if (newExpanded.has(teamId)) {
            newExpanded.delete(teamId);
        } else {
            newExpanded.add(teamId);
            // Fetch notes when expanding a team
            await fetchNotesForTeam(teamId);
        }
        setExpandedTeams(newExpanded);
    };
    const handleAddNote = async (teamId: string) => {
        if (!newNoteContent.trim()) return;

        try {
            const res = await fetch(`/api/admin/teams/${teamId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newNoteContent,
                    author: 'Admin User', // Replace with dynamic admin name if available
                }),
            });

            if (res.ok) {
                const savedNote = await res.json();
                // Add the new note to our state
                setTeamNotes(prev => ({
                    ...prev,
                    [teamId]: [savedNote, ...(prev[teamId] || [])],
                }));
                setNewNoteContent(''); // Clear the input
            }
        } catch (err) {
            console.error('Failed to add note:', err);
        }
    };

    const teamCreatedAt = (createdAt: Date) => {
        return new Date(createdAt).toLocaleString(undefined, {
            hour12: true,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "approved":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "rejected":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#0F0F1A] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-300">Loading teams...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#0F0F1A] text-gray-200 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                        Team Administration
                    </h1>
                    <p className="text-gray-400">
                        Manage all registered teams and their payment status
                    </p>
                </header>

                {/* Filters and Search */}
                <div className="bg-[#121218] rounded-xl p-4 mb-6 border border-gray-800/50 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search teams by name, ID, email or phone..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D12] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-[#0D0D12] border border-gray-800 rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30"
                                    value={statusFilter}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        setStatusFilter(
                                            e.target.value as
                                            | "all"
                                            | "pending"
                                            | "approved"
                                            | "rejected"
                                        )
                                    }
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <Filter
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                                    size={18}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#121218] p-4 rounded-xl border border-gray-800/50">
                        <div className="text-gray-400 text-sm">Total Teams</div>
                        <div className="text-2xl font-bold text-white">{teams.length}</div>
                    </div>
                    <div className="bg-[#121218] p-4 rounded-xl border border-gray-800/50">
                        <div className="text-gray-400 text-sm">Pending Payments</div>
                        <div className="text-2xl font-bold text-yellow-400">
                            {teams.filter((t) => t.payment.status === "pending").length}
                        </div>
                    </div>
                    <div className="bg-[#121218] p-4 rounded-xl border border-gray-800/50">
                        <div className="text-gray-400 text-sm">Approved Payments</div>
                        <div className="text-2xl font-bold text-green-400">
                            {teams.filter((t) => t.payment.status === "approved").length}
                        </div>
                    </div>
                    <div className="bg-[#121218] p-4 rounded-xl border border-gray-800/50">
                        <div className="text-gray-400 text-sm">Rejected Payments</div>
                        <div className="text-2xl font-bold text-red-400">
                            {teams.filter((t) => t.payment.status === "rejected").length}
                        </div>
                    </div>
                </div>

                {/* Teams List */}
                <div className="space-y-4">
                    {filteredTeams.length === 0 ? (
                        <div className="text-center py-12 bg-[#121218] rounded-xl border border-gray-800/50">
                            <Users className="mx-auto text-gray-600 mb-3" size={48} />
                            <h3 className="text-lg font-medium text-gray-400">
                                No teams found
                            </h3>
                            <p className="text-gray-600 mt-1">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    ) : (
                        filteredTeams.map((team) => (
                            <Card
                                key={team._id}
                                className="bg-[#121218] border-gray-800/50 overflow-hidden transition-all hover:border-purple-500/30"
                            >
                                <CardContent className="p-0">
                                    {/* Team Header */}
                                    <div className="p-4 sm:p-6 border-b border-gray-800/50">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-xl font-semibold text-white">
                                                        {team.teamLeader.name}&#39;s Team
                                                    </h2>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                            team.payment.status
                                                        )}`}
                                                    >
                                                        {team.payment.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-gray-400 flex items-center gap-2">
                                                    <span className="font-mono text-sm">
                                                        {team.teamId}
                                                    </span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-sm flex items-center gap-1">
                                                        <Users size={14} />
                                                        {team.teamLeader.teamSize} member
                                                        {team.teamLeader.teamSize !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200"
                                                    onClick={() => setEditingTeam(team)}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200"
                                                    onClick={() => handleDelete(team._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white"
                                                    onClick={() => toggleTeamExpansion(team._id)}
                                                >
                                                    {expandedTeams.has(team._id) ? (
                                                        <>
                                                            <span className="mr-1">Collapse</span>
                                                            <ChevronUp size={16} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="mr-1">Expand</span>
                                                            <ChevronDown size={16} />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collapsible Content */}
                                    {expandedTeams.has(team._id) && (
                                        <div className="p-4 sm:p-6 bg-[#0D0D12]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Leader Details */}
                                                <div>
                                                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                                        <User size={18} />
                                                        Team Leader
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm text-gray-400">Name</p>
                                                            <p className="text-white">
                                                                {team.teamLeader.name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">
                                                                College & Department
                                                            </p>
                                                            <p className="text-white">
                                                                {team.teamLeader.college},{" "}
                                                                {team.teamLeader.department}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <p className="text-sm text-gray-400">
                                                                    <MapPin size={14} className="inline mr-1" />
                                                                    City
                                                                </p>
                                                                <p className="text-white">
                                                                    {team.teamLeader.city}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-400">
                                                                    <Phone size={14} className="inline mr-1" />
                                                                    Phone
                                                                </p>
                                                                <a href={`tel:+91${team.teamLeader.phoneNumber}`}>
                                                                    <p className="text-white">{team.teamLeader.phoneNumber}</p>
                                                                </a>

                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">
                                                                <Mail size={14} className="inline mr-1" />
                                                                Email
                                                            </p>
                                                            <p className="text-white break-all">
                                                                {team.teamLeader.email}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Registered at:  {teamCreatedAt(team.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Team Members */}
                                                <div>
                                                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                                        <Users size={18} />
                                                        Team Members
                                                    </h3>
                                                    {team.teamMembers.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {team.teamMembers.map((member, idx) => (
                                                                <div
                                                                    key={member._id}
                                                                    className="bg-[#121218] p-3 rounded-lg border border-gray-800/30"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="text-white font-medium">
                                                                                {member.name}
                                                                            </p>
                                                                            <p className="text-sm text-gray-400">
                                                                                {member.email}
                                                                            </p>
                                                                            <a href={`tel:+91${member.phoneNumber}`}>
                                                                                <p className="text-sm text-gray-400">
                                                                                    {member.phoneNumber}
                                                                                </p>
                                                                            </a>
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                                                                            Member {idx + 1}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">
                                                            No team members added
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment Section */}
                                            <div className="mt-6 pt-6 border-t border-gray-800/50">
                                                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                                    <CreditCard size={18} />
                                                    Payment Details
                                                </h3>
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-400">Amount</p>
                                                        <p className="text-white text-xl font-semibold">
                                                            ₹{team.payment.amount}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Last updated:{" "}
                                                            {new Date(
                                                                team.payment.updatedAt
                                                            ).toLocaleDateString()}
                                                        </p>

                                                    </div>

                                                    {team.payment.status === "pending" && (
                                                        <div className="flex gap-3">
                                                            <Button
                                                                onClick={() =>
                                                                    handlePayment(team._id, "approve")
                                                                }
                                                                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg"
                                                                disabled={actionLoading === team._id}
                                                            >
                                                                {actionLoading === team._id ? (
                                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                ) : (
                                                                    "Approve Payment"
                                                                )}
                                                            </Button>
                                                            <Button
                                                                onClick={() =>
                                                                    handlePayment(team._id, "reject")
                                                                }
                                                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
                                                                disabled={actionLoading === team._id}
                                                            >
                                                                {actionLoading === team._id ? (
                                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                ) : (
                                                                    "Reject Payment"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Admin Notes Section */}
                                            <div className="mt-6 pt-6 border-t border-gray-800/50">
                                                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                                    <Pencil size={18} />
                                                    Admin Notes
                                                </h3>

                                                {/* Add Note Form */}
                                                <div className="mb-4">
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Add an internal note about this team..."
                                                        className="w-full text-white p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        value={newNoteContent}
                                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                                    />
                                                    <Button
                                                        onClick={() => handleAddNote(team._id)}
                                                        className="mt-2 bg-purple-600 hover:bg-purple-500"
                                                        disabled={!newNoteContent.trim()}
                                                    >
                                                        Add Note
                                                    </Button>
                                                </div>

                                                {/* Notes List */}
                                                <div className="space-y-3">
                                                    {(teamNotes[team._id] || []).length === 0 ? (
                                                        <p className="text-gray-500 text-center py-4">No notes yet.</p>
                                                    ) : (
                                                        (teamNotes[team._id] || []).map((note) => (
                                                            <div key={note._id} className="bg-[#0D0D12] p-4 rounded-lg border border-gray-700/30">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-sm font-medium text-purple-300">{note.author}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(note.createdAt).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-200 whitespace-pre-wrap">{note.content}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Edit Modal */}
                {editingTeam && formData && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
                        <div className="bg-[#121218] p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    Edit Team - {editingTeam.teamId}
                                </h2>
                                <button
                                    onClick={() => setEditingTeam(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-3">
                                        Team Leader
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Name
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={formData.teamLeader?.name || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        teamLeader: {
                                                            ...formData.teamLeader,
                                                            name: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                College
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={formData.teamLeader?.college || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        teamLeader: {
                                                            ...formData.teamLeader,
                                                            college: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Department
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={formData.teamLeader?.department || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        teamLeader: {
                                                            ...formData.teamLeader,
                                                            department: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                City
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={formData.teamLeader?.city || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        teamLeader: {
                                                            ...formData.teamLeader,
                                                            city: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Phone
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={formData.teamLeader?.phoneNumber || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        teamLeader: {
                                                            ...formData.teamLeader,
                                                            phoneNumber: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Email
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                value={formData.teamLeader?.email || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        teamLeader: {
                                                            ...formData.teamLeader,
                                                            email: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-white mb-3">
                                        Team Members
                                    </h3>
                                    <div className="space-y-4">
                                        {formData.teamMembers?.map(
                                            (member: TeamMember, idx: number) => (
                                                <div
                                                    key={member._id || idx}
                                                    className="bg-[#0D0D12] p-4 rounded-lg border border-gray-700"
                                                >
                                                    <h4 className="text-gray-400 mb-2">
                                                        Member {idx + 1}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                Name
                                                            </label>
                                                            <input
                                                                className="w-full p-2.5 rounded-lg bg-[#121218] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                value={member.name || ""}
                                                                onChange={(e) => {
                                                                    const newMembers = [...formData.teamMembers];
                                                                    newMembers[idx].name = e.target.value;
                                                                    setFormData({
                                                                        ...formData,
                                                                        teamMembers: newMembers,
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                Email
                                                            </label>
                                                            <input
                                                                className="w-full p-2.5 rounded-lg bg-[#121218] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                value={member.email || ""}
                                                                onChange={(e) => {
                                                                    const newMembers = [...formData.teamMembers];
                                                                    newMembers[idx].email = e.target.value;
                                                                    setFormData({
                                                                        ...formData,
                                                                        teamMembers: newMembers,
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                Phone
                                                            </label>
                                                            <input
                                                                className="w-full p-2.5 rounded-lg bg-[#121218] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                value={member.phoneNumber || ""}
                                                                onChange={(e) => {
                                                                    const newMembers = [...formData.teamMembers];
                                                                    newMembers[idx].phoneNumber = e.target.value;
                                                                    setFormData({
                                                                        ...formData,
                                                                        teamMembers: newMembers,
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingTeam(null)}
                                    className="border-gray-700 bg-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    className="bg-purple-600 hover:bg-purple-500"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
