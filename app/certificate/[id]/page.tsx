"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    ShieldCheck,
    Calendar,
    User,
    Mail,
    Hash,
    Building2,
    ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";

interface Certificate {
    certificateId: string;
    studentName: string;
    email: string;
    fileUrl: string;
    issuedAt: string;
    eventName?: string;
    position?: string;
}

export default function CertificatePage() {
    const { id } = useParams();
    const [cert, setCert] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState("");

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const res = await fetch(`/api/certificates/${id}`);
                if (!res.ok) throw new Error("Not Found");
                const data = await res.json();
                setCert(data);

                // Generate QR code for verification
                const verificationUrl = `${window.location.origin}/certificate/${id}`;
                const qr = await QRCode.toDataURL(verificationUrl, {
                    width: 150,
                    margin: 1,
                    color: { dark: "#8b5cf6", light: "#121214" },
                });
                setQrCode(qr);
            } catch (error) {
                console.error("❌ Certificate not found", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] text-purple-400 p-4">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (!cert) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0f] text-purple-200 p-4">
                <div className="text-center">
                    <ShieldCheck size={64} className="mx-auto text-red-400 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
                    <p className="text-gray-400 mb-6">
                        The certificate you&#39;re looking for doesn&#39;t exist or has been
                        removed.
                    </p>
                    <Button
                        onClick={() => (window.location.href = "/")}
                        className="bg-purple-700 hover:bg-purple-600"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0c0c0f] text-gray-200">
            {/* Header */}
            <header className="relative flex justify-between items-center p-4 border-b border-gray-800 bg-black/40 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <Image
                        src="/jws-logo.png"
                        alt="JWS Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    <div className="sm:block">
                        <h1 className="text-base sm:text-lg font-bold text-white">
                            Powed by JWS Technologies
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300">
                            Certificate Verification
                        </p>
                    </div>
                </div>
                <Link
                    href="/"
                    className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        Certificate of Participation
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        This certificate verifies participation in the Hackathon 2025 <br />{" "}
                        Department of Information Technology, St. Joseph&#39;s College - Trichy
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Certificate Details */}
                    <div className="md:col-span-2">
                        <Card className="bg-[#121214] border-purple-800/40 mb-6">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Certificate Details
                                    </h2>
                                    <div className="flex items-center gap-2 text-green-400">
                                        <ShieldCheck size={20} />
                                        <span>Verified</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                                <User size={16} />
                                                Participant Name
                                            </p>
                                            <p className="text-white text-lg font-medium">
                                                {cert.studentName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                                <Mail size={16} />
                                                Email Address
                                            </p>
                                            <p className="text-white">{cert.email}</p>
                                        </div>

                                        {cert.eventName && (
                                            <div>
                                                <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                                    <Building2 size={16} />
                                                    Event
                                                </p>
                                                <p className="text-white">{cert.eventName}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                                <Hash size={16} />
                                                Credential ID
                                            </p>
                                            <p className="text-white font-mono">
                                                {cert.certificateId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                                <Calendar size={16} />
                                                Issued On
                                            </p>
                                            <p className="text-white">
                                                {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        {cert.position && (
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">
                                                    Achievement
                                                </p>
                                                <p className="text-white">{cert.position}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-800/50 flex flex-wrap gap-3">
                                    <a
                                        href={cert.fileUrl}
                                        download
                                        className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                        Download Certificate
                                    </a>

                                    <Button
                                        variant="outline"
                                        className="border-purple-700/40 text-purple-300 hover:bg-purple-700/20 hover:text-purple-200"
                                        onClick={() => window.print()}
                                    >
                                        Print Certificate
                                    </Button>

                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                            `${window.location.origin}/certificate/${cert.certificateId}`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#0077b5] hover:bg-[#006097] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                    >
                                        <ExternalLink size={16} />
                                        Share on LinkedIn
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Info */}
                        <Card className="bg-[#121214] border-purple-800/40">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Verification Information
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    This certificate can be verified anytime by visiting the URL
                                    below or scanning the QR code:
                                </p>
                                <p className="text-purple-400 font-mono text-sm break-all mb-4">
                                    {typeof window !== "undefined"
                                        ? `${window.location.origin}/certificate/${cert.certificateId}`
                                        : ""}
                                </p>
                                <p className="text-gray-400 text-xs">
                                    Issued by JWS Technologies in partnership with St. Joseph&#39;s
                                    College, Department of Information Technology.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Certificate Preview & QR Code */}
                    <div className="space-y-6">
                        <Card className="bg-[#121214] border-purple-800/40">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Certificate Preview
                                </h3>
                                <div className="aspect-[4/3] bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-lg flex items-center justify-center">
                                    <Image
                                        src={cert.fileUrl}
                                        alt="Certificate"
                                        width={400}
                                        height={300}
                                        className="rounded-md object-contain max-h-64"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121214] border-purple-800/40">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Verification QR Code
                                </h3>
                                <div className="flex flex-col items-center">
                                    {qrCode ? (
                                        <Image
                                            src={qrCode}
                                            alt="Verification QR Code"
                                            width={150}
                                            height={150}
                                            className="rounded border border-purple-700/30 mb-4"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-800 animate-pulse rounded mb-4"></div>
                                    )}
                                    <p className="text-gray-400 text-xs text-center">
                                        Scan to verify this certificate
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <footer className="mt-12 py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>© 2025 JWS Technologies. All rights reserved.</p>
            </footer>
        </div>
    );
}
