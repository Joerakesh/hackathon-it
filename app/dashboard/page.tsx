"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LogOut, WalletMinimal, User, Mail, Phone,
    MapPin, Building, GraduationCap, Download, Bell,
    ExternalLink, Trophy, ShieldAlert, Binary, Clock
} from "lucide-react";

/* ================= DASHBOARD ================= */

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch("/api/me", { credentials: "include" });
                if (!res.ok) throw new Error("Unauthorized");
                const data = await res.json();
                setUser(data);

                if (data.payment.status === "pending") {
                    const upiUrl = `upi://pay?pa=7094594221@naviaxis&pn=GLITCH%20FIX&am=250&cu=INR&tn=${data._id}`;
                    const qr = await QRCode.toDataURL(upiUrl, {
                        width: 300,
                        margin: 2,
                        color: { dark: "#a855f7", light: "#000000" }
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

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0f] text-purple-500">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="font-mono animate-pulse uppercase tracking-widest">Compiling Assets...</p>
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#09090b] text-gray-200 font-sans pb-10">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-purple-600 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <Image src="/jws-logo.png" alt="JWS" width={24} height={24} className="brightness-200" />
                        </div>
                        <h1 className="text-lg text-white tracking-tighter text-white">GLITCH <span className="text-purple-500">FIX</span></h1>
                    </div>
                    <button onClick={() => router.push('/logout')} className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors flex items-center gap-2">
                        <LogOut size={14} /> LOGOUT
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

                {/* TOP SECTION: User & Payment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Card */}
                    <Card className="bg-[#121214] border-white/5">
                        <CardHeader className="pb-2">
                            <Badge className="w-fit mb-2 bg-purple-500/10 text-purple-400 border-none">PARTICIPANT</Badge>
                            <CardTitle className="text-2xl text-white font-bold">{user.name}</CardTitle>
                            <p className="text-xs text-gray-500 font-mono">{user._id}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-400"><GraduationCap size={16} /> {user.college}</div>
                                <div className="flex items-center gap-2 text-sm text-gray-400"><Building size={16} /> {user.department}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Status Card */}
                    <Card className="lg:col-span-2 bg-[#121214] border-purple-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6">
                            <StatusBadge status={user.payment.status} />
                        </div>
                        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Registration Status</h3>
                                <p className="text-3xl text-white mb-4">₹250 <span className="text-sm font-normal text-gray-500">{user.payment.status}</span></p>
                                <ul className="text-xs space-y-2 text-gray-400">
                                    <li className="flex items-center gap-2">✅ Food & Snacks Provided</li>
                                    <li className="flex items-center gap-2">✅ Participation Certificate included</li>
                                </ul>
                            </div>
                            {user.payment.status === "pending" && qrCode && (
                                <div className="bg-purple-500 p-2 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                    <Image src={qrCode} alt="UPI" width={140} height={140} />
                                    <p className="text-[10px] text-white text-center font-bold mt-1">SCAN TO PAY</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* MIDDLE SECTION: THE LEVELS */}
                <h3 className="text-lg font-bold flex items-center gap-2 pt-4">
                    <Binary className="text-purple-500" /> Event Structure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <LevelCard num="1" title="PRELIMS" lang="C" time="20m" slash="500 → 100" />
                    <LevelCard num="2" title="INTERMEDIATE" lang="C" time="20m" slash="100 → 50" />
                    <LevelCard num="3" title="ADVANCED" lang="Python" time="20m" slash="50 → 25" />
                    <LevelCard num="4" title="EXPERT" lang="Java" time="30m" slash="25 → 7" />
                    <LevelCard num="5" title="FINALS" lang="Java" time="45m" slash="Top 7" isFinal />
                </div>

                {/* BOTTOM SECTION: PRIZES & RULES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Prizes */}
                    <Card className="bg-[#121214] border-yellow-500/20">
                        <CardHeader>
                            <CardTitle className="text-md flex items-center gap-2 text-yellow-500">
                                <Trophy size={18} /> Prize Pool
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                                <p className="text-[10px] text-yellow-600 font-bold uppercase">Winner</p>
                                <p className="text-xl text-white">₹5,000</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-400/5 border border-gray-400/10">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Runner Up</p>
                                <p className="text-xl text-white text-gray-300">₹3,000</p>
                            </div>
                            <div className="text-xs text-gray-500 col-span-2 text-center">
                                3rd: ₹2k • 4th: ₹1k
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rules */}
                    <Card className="bg-[#121214] border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-md flex items-center gap-2 text-red-500">
                                <ShieldAlert size={18} /> Vital Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2 text-gray-400">
                            <p className="flex items-center gap-2">🚫 No Internet or Mobile Phones</p>
                            <p className="flex items-center gap-2">🚫 No Smart Watches / External Devices</p>
                            <p className="flex items-center gap-2 text-red-400/80 font-medium">⚠️ Malpractice leads to immediate disqualification</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

/* Helper Components */

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

function LevelCard({ num, title, lang, time, slash, isFinal }: any) {
    return (
        <div className={`p-4 rounded-xl border ${isFinal ? 'border-purple-500/40 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-white/5 bg-white/5'}`}>
            <p className="text-[10px] font-bold text-purple-500 mb-1">LEVEL {num}</p>
            <h4 className="text-xs text-white mb-3 text-white uppercase truncate">{title}</h4>
            <div className="space-y-1">
                <p className="text-[11px] flex items-center gap-1.5 text-gray-300 italic"><Binary size={10} /> {lang}</p>
                <p className="text-[11px] flex items-center gap-1.5 text-gray-400"><Clock size={10} /> {time}</p>
                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-purple-400 font-mono">
                    {slash}
                </div>
            </div>
        </div>
    );
}