"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    // Bell,
    LogOut,
    WalletMinimal,
    User,
    UserRound,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    FileDown,
    Building,
    // Menu,
    // X,
} from "lucide-react";
import QRCode from "qrcode";

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
}
interface GalleryData {
    _id: string;
    teamId: string;// optional if not uploaded yet
    images?: string[];    // array of image URLs if you store them
    createdAt?: string;
    updatedAt?: string;
    folderUrl?: string;   // optional folder URL for gallery
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
        amount: string;
        status: string;
    };
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
    const [gallery, setGallery] = useState<GalleryData | null>(null);
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

    const fetchGallery = async (teamId: string): Promise<GalleryData | null> => {
        try {
            const res = await fetch(`/api/gallery?teamId=${teamId}`);
            if (!res.ok) {
                console.error("Gallery fetch failed:", res.status);
                return null;
            }

            // 🛡️ Safe parse: avoid Unexpected end of JSON
            const text = await res.text();
            if (!text) {
                return null; // empty response
            }

            return JSON.parse(text) as GalleryData;
        } catch (err) {
            console.error("Error fetching gallery:", err);
            return null;
        }
    };

    useEffect(() => {
        if (!team) return;
        (async () => {
            try {
                const g = await fetchGallery(team.teamId);
                setGallery(g);
            } catch (err) {
                console.error("❌ Error fetching gallery:", err);
            }
        })();
    }, [team]);
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
            {
                icon: <Calendar className="mx-auto mb-2" />,
                title: "September 16",
                subtitle: "Event Date",
            },
            {
                icon: <Clock className="mx-auto mb-2" />,
                title: "6 Hours",
                subtitle: "Duration",
            },
            {
                icon: <Building className="mx-auto mb-2" />,
                title: "Sail Hall, St. Joseph's College",
                subtitle: "Venue",
            },
        ],
        []
    );

    // ===== Auth / Loading states =====
    if (authError) {
        return (
            <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-[#0c0c0f] text-purple-200 p-4">
                <p className="text-lg text-center">{authError}</p>
                <Button
                    className="bg-purple-700 hover:bg-purple-600"
                    onClick={() => (window.location.href = "/login")}
                >
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
                    <Image
                        src="/jws-logo.png"
                        alt="JWS Logo"
                        width={40} // pick the actual size you want
                        height={40}
                        priority // makes sure it loads immediately
                    />
                    {/* <Shield className="text-purple-500 w-6 h-6" /> */}
                    {/* ✅ Show text only on desktop */}
                    <div className="sm:block">
                        <h1 className="text-base sm:text-lg font-bold text-white">
                            Powered by JWS Technologies
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300">Hackathon 2025</p>
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
                                <h2 className="text-lg sm:text-xl font-semibold text-purple-400">
                                    {team.teamLeader.name}’s Team
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    Team ID: {team.teamId}
                                </p>
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
                        <TabsTrigger
                            value="overview"
                            className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="edit"
                            className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400"
                        >
                            Edit
                        </TabsTrigger>
                        <TabsTrigger
                            value="notices"
                            className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400"
                        >
                            Notices
                        </TabsTrigger>
                        <TabsTrigger
                            value="gallery"
                            className="flex-1 min-w-[100px] text-xs sm:text-sm text-white data-[state=active]:text-purple-400"
                        >
                            Gallery
                        </TabsTrigger>

                        {/* <TabsTrigger value="notifications" className="flex-1 min-w-[100px] text-xs sm:text-sm">Alerts</TabsTrigger> */}
                    </TabsList>

                    {/* 🟣 Overview */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Leader */}
                            <Card className="bg-[#121214] border-purple-800/40 hover:border-purple-500 transition">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex ">
                                        <UserRound className="text-purple-400 mr-2" />
                                        <h3 className="text-lg font-bold mb-4 text-purple-400">
                                            Team Leader
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <p className="flex items-center gap-2 text-sm sm:text-base text-purple-400 mt-2">
                                            Name: <span className="flex items-center text-sm sm:text-base text-gray-200">{team.teamLeader.name}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <p className="flex items-center gap-2 text-sm sm:text-base text-purple-400 mt-2">College: <span className="flex items-center text-sm sm:text-base text-gray-200"> {team.teamLeader.college}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <p className="flex items-center gap-2 text-sm sm:text-base text-purple-400 mt-2">
                                            Department:{" "}
                                            <span className="flex items-center text-sm sm:text-base text-gray-200">
                                                {" "}
                                                {team.teamLeader.department}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <p className="flex items-center gap-2 text-sm sm:text-base text-purple-400 mt-2">
                                            Place:{" "}
                                            <span className="flex items-center text-sm sm:text-base text-gray-200">
                                                {" "}
                                                {team.teamLeader.city}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <p className="flex items-center gap-2 text-sm sm:text-base text-purple-400 mt-2">
                                            Phone:{" "}
                                            <span className="flex items-center text-sm sm:text-base text-gray-200">
                                                {" "}
                                                {team.teamLeader.phoneNumber}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                                        <p className="flex items-center gap-2 text-sm sm:text-base text-purple-400 mt-2">
                                            Mail:{" "}
                                            <span className="flex items-center text-sm sm:text-base text-gray-200">
                                                {" "}
                                                {team.teamLeader.email}
                                            </span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Members */}
                            <Card className="bg-[#121214] border-purple-800/40 hover:border-purple-500 transition">
                                <CardContent className="p-4 sm:p-5">
                                    <h3 className="text-lg font-bold mb-4 text-purple-400">
                                        Team Members
                                    </h3>
                                    {team.teamMembers.length > 0 ? (
                                        <ul className="space-y-3 text-white">
                                            {team.teamMembers.map((m) => (
                                                <li key={m._id || m.phoneNumber || m.name}>
                                                    {m.name}
                                                    {" - "}
                                                    {m.phoneNumber}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            No team members added yet
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 💳 Payment Card */}
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-6">
                            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <div className="flex">
                                        <WalletMinimal className={"text-purple-400 mr-2"} />
                                        <h3 className="text-lg font-bold text-purple-400 mb-2">
                                            Team Payment
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Registration fee per person:{" "}
                                        <span className="font-semibold text-white">₹200</span>
                                    </p>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Total team members:{" "}
                                        <span className="font-semibold text-white">
                                            {team.teamMembers.length + 1}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Total amount:{" "}
                                        <span className="font-semibold text-white">
                                            ₹{(team.teamMembers.length + 1) * 200}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        Status:{" "}
                                        {team.payment?.status === "pending" && (
                                            <span className="text-yellow-400 font-semibold">
                                                Pending
                                            </span>
                                        )}
                                        {team.payment?.status === "approved" && (
                                            <span className="text-green-400 font-semibold">
                                                Payment Successful ✅
                                            </span>
                                        )}
                                        {team.payment?.status === "rejected" && (
                                            <span className="text-red-400 font-semibold">
                                                Payment Failed ❌
                                            </span>
                                        )}
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
                                        <p className="text-xs sm:text-sm text-gray-400">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 📝 Edit */}
                    {/* 📝 Edit */}
                    <TabsContent value="edit" className="mt-6">
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-6">
                            <h3 className="text-lg font-bold text-purple-400 mb-4">
                                ✏️ Edit Team Details
                            </h3>

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
                                        <h4 className="text-md font-semibold text-purple-300 mb-3">
                                            Leader Details
                                        </h4>
                                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    Leader Name
                                                </label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    placeholder="Full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                    placeholder="Email address"
                                                    type="email"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            phoneNumber: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Phone number"
                                                    type="tel"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    City
                                                </label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.city}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, city: e.target.value })
                                                    }
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm text-gray-300 mb-1">
                                                    College
                                                </label>
                                                <input
                                                    className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                    value={formData.college}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            college: e.target.value,
                                                        })
                                                    }
                                                    placeholder="College / Institution"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ==== Members Section ==== */}
                                    <div>
                                        <h4 className="text-md font-semibold text-purple-300 mb-3">
                                            Team Members
                                        </h4>
                                        {team.teamMembers.length > 0 ? (
                                            <div className="space-y-4">
                                                {team.teamMembers.map((member, idx) => (
                                                    <div
                                                        key={member._id || idx}
                                                        className="p-3 bg-black/30 rounded border border-purple-800/40"
                                                    >
                                                        <p className="text-sm text-purple-400 mb-2">
                                                            Member {idx + 1}
                                                        </p>
                                                        <input
                                                            className="w-full p-2 mb-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                            value={team.teamMembers[idx].name}
                                                            onChange={(e) => {
                                                                const updatedMembers = [...team.teamMembers];
                                                                updatedMembers[idx] = {
                                                                    ...updatedMembers[idx],
                                                                    name: e.target.value,
                                                                };
                                                                setTeam({
                                                                    ...team,
                                                                    teamMembers: updatedMembers,
                                                                });
                                                            }}
                                                            placeholder="Full name"
                                                        />
                                                        <input
                                                            className="w-full p-2 mb-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                            value={team.teamMembers[idx].email}
                                                            onChange={(e) => {
                                                                const updatedMembers = [...team.teamMembers];
                                                                updatedMembers[idx] = {
                                                                    ...updatedMembers[idx],
                                                                    email: e.target.value,
                                                                };
                                                                setTeam({
                                                                    ...team,
                                                                    teamMembers: updatedMembers,
                                                                });
                                                            }}
                                                            placeholder="Email address"
                                                        />
                                                        <input
                                                            className="w-full p-2 bg-black border border-purple-800 rounded text-white text-sm sm:text-base"
                                                            value={team.teamMembers[idx].phoneNumber}
                                                            onChange={(e) => {
                                                                const updatedMembers = [...team.teamMembers];
                                                                updatedMembers[idx] = {
                                                                    ...updatedMembers[idx],
                                                                    phoneNumber: e.target.value,
                                                                };
                                                                setTeam({
                                                                    ...team,
                                                                    teamMembers: updatedMembers,
                                                                });
                                                            }}
                                                            placeholder="Phone number"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">
                                                No team members added yet
                                            </p>
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
                            <h3 className="text-lg font-bold text-purple-400 mb-4">
                                📑 Important Notices
                            </h3>
                            {notices.length > 0 ? (
                                <ul className="space-y-3 sm:space-y-4">
                                    {notices.map((n) => (
                                        <li
                                            key={n._id}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <span className="text-white text-sm sm:text-base truncate">
                                                {n.title}
                                            </span>
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
                                <p className="text-sm text-gray-400 italic">
                                    No notices published yet
                                </p>
                            )}
                        </Card>
                    </TabsContent>


                    {/* 📸 Gallery */}
                    <TabsContent value="gallery" className="mt-6">
                        <Card className="bg-[#121214] border-purple-800/40 p-4 sm:p-5">
                            <h3 className="text-lg font-bold text-purple-400 mb-4">📸 Event Photos</h3>

                            {gallery?.folderUrl ? (
                                <div className="flex flex-col gap-6">
                                    <p className="text-sm text-gray-300">
                                        We&#39;ve created a personal folder for your team&#39;s event photos. Click below to view or upload photos:
                                    </p>

                                    {/* Gallery Card with Visual Enhancement */}
                                    <div className="relative group overflow-hidden rounded-lg border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-black/70 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                                        <div className="p-5 flex flex-col md:flex-row items-center gap-5">
                                            {/* Folder Icon with Animation */}
                                            <div className="flex-shrink-0 relative">
                                                <div className="w-16 h-14 bg-gradient-to-br from-purple-700 to-purple-900 rounded-lg transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute -inset-2 bg-purple-500/10 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                                            </div>

                                            {/* Folder Info */}
                                            <div className="flex-grow">
                                                <h4 className="font-semibold text-purple-300 mb-1">Team Gallery</h4>
                                                <p className="text-xs text-gray-400 mb-3">Access your team&#39;s photo collection</p>

                                                {/* Stats Row */}
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    {/* {gallery.images && gallery.images.length > 0 ? (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                            </svg>
                                                            {gallery.images.length} photos
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-yellow-500">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                            No photos yet
                                                        </span>
                                                    )} */}

                                                    {gallery.createdAt && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                            </svg>
                                                            {new Date(gallery.createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex-shrink-0">
                                                <a
                                                    href={gallery.folderUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                    Open Gallery
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Preview Grid (if images exist) */}
                                    {gallery.images && gallery.images.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-purple-300 mb-3">Preview</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {gallery.images.slice(0, 6).map((img, index) => (
                                                    <div key={index} className="aspect-square rounded-md overflow-hidden border border-purple-900/50 relative group">
                                                        <img
                                                            src={img}
                                                            alt={`Team photo ${index + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/30 transition-colors duration-300 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                ))}
                                                {gallery.images.length > 6 && (
                                                    <div className="aspect-square rounded-md overflow-hidden border border-purple-900/50 bg-purple-950/70 flex items-center justify-center">
                                                        <span className="text-purple-300 text-sm">+{gallery.images.length - 6} more</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Instructions */}
                                    {/* <div className="mt-4 p-4 bg-black/30 rounded-lg border border-gray-800">
                                        <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            How to add photos
                                        </h4>
                                        <ul className="text-xs text-gray-400 space-y-1">
                                            <li>• Click "Open Gallery" to access your team folder</li>
                                            <li>• Drag and drop photos directly into the folder</li>
                                            <li>• Or use the upload button in the folder</li>
                                            <li>• Photos will appear here automatically after uploading</li>
                                        </ul>
                                    </div> */}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="mx-auto w-16 h-16 mb-4 bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <h4 className="text-purple-300 font-medium mb-2">Gallery Coming Soon</h4>
                                    <p className="text-sm text-gray-400 max-w-md mx-auto">
                                        Your team&#39;s photo gallery will be available after the event begins. Check back later to view and upload photos.
                                    </p>
                                </div>
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
        </div>
    );
}
