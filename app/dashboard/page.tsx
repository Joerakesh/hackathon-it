"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    // Bell,
    LogOut,
    Shield,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    FileDown,
    Building
    // Menu,
    // X,
} from "lucide-react";
import QRCode from "qrcode";

interface TeamMember {
    _id: string,
    name: string;
    email: string;
    phoneNumber: string;
}

interface TeamData {
    _id: string;
    teamId: string,
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
        amount: string,
        status: string,
    }
}

interface Notice {
    _id: string;
    title: string;
    fileUrl: string;
}

export default function Dashboard() {
    const [tab, setTab] = useState("overview");
    const [team, setTeam] = useState<TeamData | null>(null);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);

    const [authError, setAuthError] = useState<string | null>(null);
    // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        phoneNumber: string;
        city: string;
        college: string;
    }>({
        name: "",
        email: "",
        phoneNumber: "",
        city: "",
        college: "",
    });

    useEffect(() => {
        if (!team) return;

        const generateQR = async () => {
            try {
                const paymentAmount = (team.teamMembers.length + 1) * 200;
                const upiUrl = `upi://pay?pa=rakeshjoe52@oksbi&pn=Rakesh%20Joe&am=${paymentAmount}&cu=INR&tn=${team.teamId}`;

                const qr = await QRCode.toDataURL(upiUrl, {
                    width: 200,
                    margin: 1,
                    color: { dark: "#000000", light: "#ffffff" },
                });

                setQrCode(qr);
            } catch (err) {
                console.error("❌ Error generating QR:", err);
            }
        };

        generateQR();
    }, [team]);


    // ===== Fetch team =====
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch("/api/team", {
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to fetch team");
                const data = await res.json();
                setTeam(data);

                setFormData({
                    name: data.teamLeader.name,
                    email: data.teamLeader.email,
                    phoneNumber: data.teamLeader.phoneNumber,
                    city: data.teamLeader.city,
                    college: data.teamLeader.college,
                });
            } catch (error) {
                console.error("❌ Error fetching team:", error);
            }
        };

        fetchTeam();
    }, []);

    // ===== Fetch notices =====
    useEffect(() => {
        const fetchNotices = async () => {
            const res = await fetch("/api/notices");
            if (res.ok) {
                const data = await res.json();
                setNotices(data);
            }
        };
        fetchNotices();
    }, []);

    // ===== Save edits =====
    const handleSave = async () => {
        if (!team) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/team/${team._id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teamLeader: formData,
                    teamMembers: team.teamMembers, // ✅ include members too
                }),
            });

            if (!res.ok) throw new Error("Update failed");

            const { team: updatedTeam } = await res.json();
            setTeam(updatedTeam);
            setEditing(false);
        } catch (error) {
            console.error("❌ Error updating team:", error);
        } finally {
            setSaving(false);
        }
    };


    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" }).catch(() => { });
        } finally {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    const eventInfo = useMemo(
        () => [
            { icon: <Calendar className="mx-auto mb-2" />, title: "September 16", subtitle: "Event Date" },
            { icon: <Clock className="mx-auto mb-2" />, title: "6 Hours", subtitle: "Duration" },
            { icon: <Building className="mx-auto mb-2" />, title: "Sail Hall, St. Joseph's College", subtitle: "Venue" },
        ],
        []
    );

    // ===== Auth / Loading states =====
    if (authError) {
        return (
            <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-[#0c0c0f] text-purple-200 p-4">
                <p className="text-lg text-center">{authError}</p>
                <Button className="bg-purple-700 hover:bg-purple-600" onClick={() => (window.location.href = "/login")}>
                    Go to Login
                </Button>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] text-purple-400 p-4">
                Loading...
            </div>
        );
    }

    // const paymentAmount = team.teamLeader.teamSize * 200;
    // const upiId = "rakeshjoe52@oksbi";
    // const upiUrl = `upi://pay?pa=${upiId}&pn=Rakesh%20Joe&am=${paymentAmount}&cu=INR&tn=${team.teamId}`;
    // const qrCodeBuffer = await QRCode.toBuffer(upiUrl, {
    //     width: 200,
    //     margin: 1,
    //     color: {
    //         dark: "#000000",
    //         light: "#ffffff",
    //     },
    // });


    return (
        <div className="min-h-screen bg-[#0c0c0f] text-gray-200 font-mono">
            {/* 🔝 Navbar */}
            <header className="relative flex justify-between items-center p-4 border-b border-gray-800 bg-black/40 backdrop-blur-md z-20">
                {/* Left: Logo + Title */}
                <div className="flex items-center gap-3">
                    <Shield className="text-purple-500 w-6 h-6" />
                    {/* ✅ Show text only on desktop */}
                    <div className="sm:block">
                        <h1 className="text-base sm:text-lg font-bold text-white">
                            Team Leader Portal
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300">
                            Welcome back, {team.teamLeader.name}
                        </p>
                    </div>

                </div>

                {/* ✅ Desktop Logout button */}
                <button
                    className="sm:flex items-center gap-2 text-sm text-gray-300 hover:text-purple-400 transition-colors"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <LogOut size={16} /> Logout
                </button>

                {/* Mobile Menu Toggle */}
                {/* <div className="sm:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-md text-purple-400 hover:bg-purple-800/20 transition"
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div> */}

                {/* Mobile Dropdown Menu */}
                {/* <div
                    className={`absolute top-full left-0 w-full bg-black/95 border-b border-gray-800 flex-col gap-4 p-4 sm:hidden transition-all duration-300 ${mobileMenuOpen ? "flex opacity-100" : "hidden opacity-0"
                        }`}
                >
                    <div className="flex flex-col gap-3">
                        
                        <button
                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-purple-400 transition"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div> */}
            </header>


            <main className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* 🪪 Team Card */}
                <Card className="bg-gradient-to-r from-purple-950 via-black to-purple-900 border-purple-700/30 shadow-lg shadow-purple-800/30 mb-6">
                    <CardContent className="flex flex-col sm:flex-row justify-between items-center py-5 gap-4 sm:gap-0">
                        <div className="flex items-center gap-4">
                            <User className="text-purple-400 w-8 h-8 sm:w-10 sm:h-10" />
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-purple-400">{team.teamLeader.name}’s Team</h2>
                                <p className="text-xs sm:text-sm text-gray-400">Team ID: {team.teamId}</p>
                            </div>
                        </div>
                        <span className="bg-purple-700/80 px-3 py-1 rounded-full text-xs sm:text-sm text-white">
                            Confirmed
                        </span>



                    </CardContent>
                </Card>

                {/* 📑 Tabs */}
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="bg-[#121214] border border-gray-800 w-full flex overflow-x-auto">
                        <TabsTrigger value="overview" className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400">Overview</TabsTrigger>
                        <TabsTrigger value="edit" className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400">Edit</TabsTrigger>
                        <TabsTrigger value="notices" className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400">Notices</TabsTrigger>
                        {/* <TabsTrigger value="notifications" className="flex-1 min-w-[100px] text-xs sm:text-sm">Alerts</TabsTrigger> */}
                    </TabsList>

                    {/* 🟣 Overview */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Leader */}
                            <Card className="bg-[#121214] border-purple-800/40 hover:border-purple-500 transition">
                                <CardContent className="p-4 sm:p-5">
                                    <h3 className="text-lg font-bold mb-4 text-purple-400">Team Leader</h3>
                                    <p className="font-semibold text-white">{team.teamLeader.name}</p>
                                    <p className="flex items-center gap-2 text-sm sm:text-base text-gray-300 mt-2">
                                        <MapPin size={16} /> {team.teamLeader.college},<br /> {team.teamLeader.department},<br /> {team.teamLeader.city}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <Phone size={16} /> {team.teamLeader.phoneNumber}
                                    </p>

                                    <p className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <Mail size={16} /> {team.teamLeader.email}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Members */}
                            <Card className="bg-[#121214] border-purple-800/40 hover:border-purple-500 transition">
                                <CardContent className="p-4 sm:p-5">
                                    <h3 className="text-lg font-bold mb-4 text-purple-400">Team Members</h3>
                                    {team.teamMembers.length > 0 ? (
                                        <ul className="space-y-3 text-white">
                                            {team.teamMembers.map((m) => (
                                                <li key={m._id || m.phoneNumber || m.name}>{m.name}{" - "}{m.phoneNumber}</li>
                                            ))}

                                        </ul>

                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No team members added yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 💳 Payment Card */}
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-6">
                            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-purple-400 mb-2">💰 Team Payment</h3>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Registration fee per person: <span className="font-semibold text-white">₹200</span>
                                    </p>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Total team members: <span className="font-semibold text-white">{team.teamMembers.length + 1}</span>
                                    </p>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Total amount: <span className="font-semibold text-white">₹{(team.teamMembers.length + 1) * 200}</span>
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        Status:{" "}
                                        {team.payment?.status === "pending" && <span className="text-yellow-400 font-semibold">Pending</span>}
                                        {team.payment?.status === "approved" && <span className="text-green-400 font-semibold">Payment Successful ✅</span>}
                                        {team.payment?.status === "rejected" && <span className="text-red-400 font-semibold">Payment Failed ❌</span>}
                                    </p>
                                </div>

                                {/* Show GPay button only if payment pending */}
                                {team.payment?.status === "pending" && (
                                    <div className="flex flex-col items-center gap-3">
                                        {/* <a
                                            href={`upi://pay?pa=rakeshjoe52@oksbi&pn=Rakesh%20Joe&am=${(team.teamMembers.length + 1) * 200}&cu=INR&tn=${team.teamId}`}
                                            className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm sm:text-base"
                                        >
                                            Pay via GPay
                                        </a> */}

                                        {qrCode && (
                                            <Image
                                                src={qrCode}
                                                alt="UPI QR Code"
                                                width={200}
                                                height={200}
                                                unoptimized
                                                className="rounded-md border border-purple-700"
                                            />
                                        )}
                                    </div>
                                )}


                                {/* Retry button if rejected */}
                                {team.payment?.status === "rejected" && (
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                                    >
                                        Retry Payment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        {/* Event Info */}
                        <Card className="bg-[#121214] border-purple-800/40">
                            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 text-center">
                                {eventInfo.map((item, idx) => (
                                    <div key={idx} className="p-2 flex-1">
                                        {item.icon ? (
                                            <div className="text-purple-400 mx-auto mb-2 flex justify-center">
                                                {item.icon}
                                            </div>
                                        ) : null}
                                        <p className="text-purple-400 font-bold text-sm sm:text-base">
                                            {item.title}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-400">{item.subtitle}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </TabsContent>

                    {/* 📝 Edit */}
                    {/* 📝 Edit */}
                    <TabsContent value="edit" className="mt-6">
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-6">
                            <h3 className="text-lg font-bold text-purple-400 mb-4">✏️ Edit Team Details</h3>

                            {!editing ? (
                                <Button
                                    onClick={() => setEditing(true)}
                                    className="bg-purple-700 hover:bg-purple-600 w-full sm:w-auto"
                                >
                                    Start Editing
                                </Button>
                            ) : (
                                <div className="space-y-6">
                                    {/* ==== Leader Details ==== */}
                                    <div>
                                        <h4 className="text-md font-semibold text-purple-300 mb-3">Leader Details</h4>
                                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm text-gray-300 mb-1">Leader Name</label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">Email</label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="Email address"
                                                    type="email"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">Phone</label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    placeholder="Phone number"
                                                    type="tel"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">City</label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm text-gray-300 mb-1">College</label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.college}
                                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                                    placeholder="College / Institution"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ==== Members Section ==== */}
                                    <div>
                                        <h4 className="text-md font-semibold text-purple-300 mb-3">Team Members</h4>
                                        {team.teamMembers.length > 0 ? (
                                            <div className="space-y-4">
                                                {team.teamMembers.map((member, idx) => (
                                                    <div key={member._id || idx} className="p-3 bg-black/30 rounded border border-purple-800/40">
                                                        <p className="text-sm text-purple-400 mb-2">Member {idx + 1}</p>
                                                        <input
                                                            className="w-full p-2 mb-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                            value={team.teamMembers[idx].name}
                                                            onChange={(e) => {
                                                                const updatedMembers = [...team.teamMembers];
                                                                updatedMembers[idx] = { ...updatedMembers[idx], name: e.target.value };
                                                                setTeam({ ...team, teamMembers: updatedMembers });
                                                            }}
                                                            placeholder="Full name"
                                                        />
                                                        <input
                                                            className="w-full p-2 mb-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                            value={team.teamMembers[idx].email}
                                                            onChange={(e) => {
                                                                const updatedMembers = [...team.teamMembers];
                                                                updatedMembers[idx] = { ...updatedMembers[idx], email: e.target.value };
                                                                setTeam({ ...team, teamMembers: updatedMembers });
                                                            }}
                                                            placeholder="Email address"
                                                        />
                                                        <input
                                                            className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                            value={team.teamMembers[idx].phoneNumber}
                                                            onChange={(e) => {
                                                                const updatedMembers = [...team.teamMembers];
                                                                updatedMembers[idx] = { ...updatedMembers[idx], phoneNumber: e.target.value };
                                                                setTeam({ ...team, teamMembers: updatedMembers });
                                                            }}
                                                            placeholder="Phone number"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No team members added yet</p>
                                        )}
                                    </div>


                                    {/* ==== Action Buttons ==== */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={handleSave}
                                            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-60 flex-1"
                                            disabled={saving}
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditing(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* 📂 Notices */}
                    <TabsContent value="notices" className="mt-6">
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-5">
                            <h3 className="text-lg font-bold text-purple-400 mb-4">📑 Important Notices</h3>
                            {notices.length > 0 ? (
                                <ul className="space-y-3 sm:space-y-4">
                                    {notices.map((n) => (
                                        <li
                                            key={n._id}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <span className="text-white text-sm sm:text-base truncate">{n.title}</span>
                                            <a
                                                href={n.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Download ${n.title}`}
                                                title="Download"
                                                className="flex-shrink-0"
                                            >
                                                <FileDown className="text-purple-400 cursor-pointer w-5 h-5 sm:w-6 sm:h-6" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No notices published yet</p>
                            )}
                        </Card>
                    </TabsContent>


                    {/* 🔔 Notifications */}
                    {/* <TabsContent value="notifications" className="mt-6">
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-5">
                            <h3 className="text-lg font-bold text-purple-400 mb-4">🔔 Recent Notifications</h3>
                            <div className="space-y-3">
                                <div className="bg-[#1b1b1f] p-3 sm:p-4 rounded-lg">
                                    <p className="font-semibold text-purple-300 text-sm sm:text-base">Registration Confirmed</p>
                                    <p className="text-xs sm:text-sm text-gray-400">Your team has been successfully registered</p>
                                </div>
                                <div className="bg-[#1b1b1f] p-3 sm:p-4 rounded-lg">
                                    <p className="font-semibold text-purple-300 text-sm sm:text-base">Event Update</p>
                                    <p className="text-xs sm:text-sm text-gray-400">Venue details updated</p>
                                </div>
                                <div className="bg-[#1b1b1f] p-3 sm:p-4 rounded-lg">
                                    <p className="font-semibold text-purple-300 text-sm sm:text-base">Important Notice</p>
                                    <p className="text-xs sm:text-sm text-gray-400">Check the latest rules & regulations</p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent> */}
                </Tabs>
            </main>
        </div >
    );
}