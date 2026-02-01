"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LogOut,
    GraduationCap,
    Building,
    Binary,
    Clock,
    Trophy,
    User,
    Users,
    MapPin,
} from "lucide-react";

/* ================= TYPES (Updated) ================= */

interface ParticipantData {
    _id: string;
    participantId: string;
    event: string;
    participationType: string;
    role: string;
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
    };
}

/* ================= DASHBOARD ================= */

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<ParticipantData | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch("/api/me", { credentials: "include" });

                if (!res.ok) {
                    router.replace("/login");
                    return;
                }

                const data: ParticipantData = await res.json();
                setUser(data);

                if (data.payment.status === "pending") {
                    const upiUrl = `upi://pay?pa=7094594221@naviaxis&pn=GLITCH%20FIX&am=${data.payment.amount}&cu=INR&tn=${data.participantId}`;
                    const qr = await QRCode.toDataURL(upiUrl, {
                        width: 300,
                        margin: 2,
                        color: { dark: "#a855f7", light: "#000000" },
                    });
                    setQrCode(qr);
                }
            } catch {
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.replace("/login");
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0f] text-purple-500">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="font-mono animate-pulse uppercase tracking-widest">Accessing Terminal...</p>
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#09090b] text-gray-200 font-sans pb-10">
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-purple-600 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <Image src="/jws-logo.png" alt="JWS" width={24} height={24} className="brightness-200" />
                        </div>
                        <h1 className="text-lg text-white tracking-tighter">
                            {user.event?.split(' ')[0] || "GLITCH"}{" "}
                            <span className="text-purple-500">
                                {user.event?.split(' ')[1] || "FIX"}
                            </span>
                        </h1>
                    </div>
                    <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors flex items-center gap-2">
                        <LogOut size={14} /> LOGOUT
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

                {/* TOP SECTION: Team Info & Payment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Team Members Card */}
                    <Card className="bg-[#121214] border-white/5 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge className="bg-purple-500/10 text-purple-400 border-none uppercase text-[10px]">
                                    {user.participationType}
                                </Badge>
                                <span className="text-[10px] font-mono text-gray-500">{user.participantId}</span>
                            </div>
                            <CardTitle className="text-xl text-white pt-2 flex items-center gap-2">
                                <Users size={20} className="text-purple-500" /> Team Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {/* Leader */}
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Leader</p>
                                <p className="text-white font-medium">{user.leader.name}</p>
                                <p className="text-xs text-gray-500">{user.leader.email}</p>
                            </div>

                            {/* Member (Conditional) */}
                            {user.member && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Member</p>
                                    <p className="text-white font-medium">{user.member.name}</p>
                                    <p className="text-xs text-gray-500">{user.member.email}</p>
                                </div>
                            )}

                            <div className="space-y-2 pt-4 border-t border-white/5 text-sm text-gray-400">
                                <div className="flex items-center gap-2"><GraduationCap size={14} /> {user.leader.college}</div>
                                <div className="flex items-center gap-2"><Building size={14} /> {user.leader.department}</div>
                                <div className="flex items-center gap-2"><MapPin size={14} /> {user.leader.city}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Status Card */}
                    <Card className="lg:col-span-2 bg-[#121214] border-purple-500/20 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-6">
                            <StatusBadge status={user.payment.status} />
                        </div>
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Registration Fee</h3>
                                <p className="text-4xl text-white mb-4">₹{user.payment.amount}</p>
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                                        Status: <span className="capitalize text-gray-200">{user.payment.status}</span>
                                    </p>
                                    <ul className="text-xs space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2">✅ Full Event Access</li>
                                        <li className="flex items-center gap-2">✅ Digital Certificates</li>
                                    </ul>
                                </div>
                            </div>

                            {user.payment.status === "pending" && qrCode && (
                                <div className="text-center">
                                    <div className="bg-white p-3 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.3)] inline-block">
                                        <Image src={qrCode} alt="UPI QR" width={160} height={160} className="rounded-lg" />
                                    </div>
                                    <p className="text-[10px] text-purple-400 font-bold mt-3 tracking-widest uppercase">Scan to Complete Payment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* REST OF UI (Levels and Prizes) remains same as previous logic */}
                <h3 className="text-lg font-bold flex items-center gap-2 pt-4 text-white">
                    <Binary className="text-purple-500" /> Event Pipeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <LevelCard num="1" title="PRELIMS" lang="C" time="20m" slash="500 → 100" />
                    <LevelCard num="2" title="INTERMEDIATE" lang="C" time="20m" slash="100 → 50" />
                    <LevelCard num="3" title="ADVANCED" lang="Python" time="20m" slash="50 → 25" />
                    <LevelCard num="4" title="EXPERT" lang="Java" time="30m" slash="25 → 7" />
                    <LevelCard num="5" title="FINALS" lang="Java" time="45m" slash="Top 7" isFinal />
                </div>
            </main>
        </div>
    );
}

/* --- Sub-components --- */

function StatusBadge({ status }: { status: string }) {
    const colors = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        approved: "bg-green-500/10 text-green-500 border-green-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
        <Badge variant="outline" className={`capitalize font-bold px-4 py-1 ${colors[status as keyof typeof colors]}`}>
            {status}
        </Badge>
    );
}

function LevelCard({ num, title, lang, time, slash, isFinal = false }: any) {
    return (
        <div className={`p-4 rounded-xl border ${isFinal ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 bg-white/5'}`}>
            <p className="text-[10px] font-bold text-purple-500 mb-1">LEVEL {num}</p>
            <h4 className="text-xs text-white mb-3 uppercase truncate">{title}</h4>
            <div className="space-y-1">
                <p className="text-[11px] flex items-center gap-1.5 text-gray-300"><Binary size={10} /> {lang}</p>
                <p className="text-[11px] flex items-center gap-1.5 text-gray-400"><Clock size={10} /> {time}</p>
                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-purple-400 font-mono">{slash}</div>
            </div>
        </div>
    );
}