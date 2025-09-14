"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, User, Users, FileText, ShieldCheck } from "lucide-react";

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

interface Team {
    teamId: string;
    teamLeader: { _id: string; name: string; email: string };
    teamMembers: TeamMember[];
}

export default function UploadCertificatePage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch("/api/teams")
            .then((res) => res.json())
            .then((data) => {
                setTeams(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setStatus("❌ Failed to load teams");
                setLoading(false);
            });
    }, []);

    const handleTeamChange = (teamId: string) => {
        const team = teams.find((t) => t.teamId === teamId) || null;
        setSelectedTeam(team);
        setSelectedMember(null);
    };

    const handleMemberChange = (memberId: string) => {
        if (!selectedTeam) return;
        let member: TeamMember | null = null;

        if (selectedTeam.teamLeader._id === memberId) {
            member = { ...selectedTeam.teamLeader, phoneNumber: "" };
        } else {
            member = selectedTeam.teamMembers.find((m) => m._id === memberId) || null;
        }
        setSelectedMember(member);
    };

    const handleFileChange = (file: File | null) => {
        setFile(file);
        if (file && file.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam || !selectedMember || !file) {
            setStatus("❌ Please select team, member, and file");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("teamId", selectedTeam.teamId);
        formData.append("memberId", selectedMember._id);
        formData.append("file", file);

        try {
            const res = await fetch("/api/certificates/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(`✅ Certificate uploaded! Link: /certificate/${data.certificateId}`);
                setSelectedTeam(null);
                setSelectedMember(null);
                setFile(null);
                setPreviewUrl(null);
            } else {
                setStatus(`❌ Error: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setStatus("❌ Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c0f] text-gray-200 p-4 sm:p-6">
            {/* Header */}
            <header className="rounded-lg relative flex justify-between items-center p-4 border-b border-gray-800 bg-black/40 backdrop-blur-md z-20 mb-6">
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
                            JWS Technologies
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300">Certificate Management</p>
                    </div>
                </div>

                <Link
                    href="/"
                    className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                >
                    Back to Home
                </Link>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        Upload Certificates
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Upload certificates for participation in the Hackathon 2025 <br />{" "}
                        Department of Information Technology, St. Joseph&#39;s College - Trichy
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Upload Form */}
                    <Card className="bg-[#121214] border-purple-800/40">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Upload className="text-purple-400" size={24} />
                                <h2 className="text-xl font-semibold text-white">Certificate Upload</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-purple-300">
                                        <Users className="inline mr-2" size={16} />
                                        Select Team
                                    </label>
                                    <select
                                        value={selectedTeam?.teamId || ""}
                                        onChange={(e) => handleTeamChange(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select a Team</option>
                                        {teams.map((t) => (
                                            <option key={t.teamId} value={t.teamId}>
                                                {t.teamId} - {t.teamLeader.name}&#39;s Team
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedTeam && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-purple-300">
                                            <User className="inline mr-2" size={16} />
                                            Select Participant
                                        </label>
                                        <select
                                            value={selectedMember?._id || ""}
                                            onChange={(e) => handleMemberChange(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-[#0D0D12] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select a Participant</option>
                                            <option value={selectedTeam.teamLeader._id}>
                                                {selectedTeam.teamLeader.name} (Team Leader)
                                            </option>
                                            {selectedTeam.teamMembers.map((m) => (
                                                <option key={m._id} value={m._id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>

                                        {selectedMember && (
                                            <div className="mt-3 p-3 bg-[#0D0D12] rounded-lg border border-gray-700/30">
                                                <p className="text-sm text-gray-300">
                                                    <span className="text-purple-300">Name:</span> {selectedMember.name}
                                                </p>
                                                <p className="text-sm text-gray-300">
                                                    <span className="text-purple-300">Email:</span> {selectedMember.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-purple-300">
                                        <FileText className="inline mr-2" size={16} />
                                        Certificate File
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#0D0D12] border-gray-600 hover:border-purple-500 hover:bg-[#0F0F1A] transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-400">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 10MB)</p>
                                            </div>
                                            <input
                                                id="dropzone-file"
                                                type="file"
                                                className="hidden"
                                                accept=".png,.jpg,.jpeg,.pdf"
                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                    {file && (
                                        <p className="mt-2 text-sm text-gray-400">
                                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-60 py-3"
                                    disabled={loading || !selectedTeam || !selectedMember || !file}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Uploading...
                                        </div>
                                    ) : (
                                        "Upload Certificate"
                                    )}
                                </Button>
                            </form>

                            {status && (
                                <div className={`mt-4 p-3 rounded-lg text-sm ${status.includes('✅') ? 'bg-green-900/30 text-green-300 border border-green-700/30' : 'bg-red-900/30 text-red-300 border border-red-700/30'}`}>
                                    {status}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview Panel */}
                    <div className="space-y-6">
                        <Card className="bg-[#121214] border-purple-800/40 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <ShieldCheck className="text-purple-400" size={24} />
                                    <h2 className="text-xl font-semibold text-white">Certificate Preview</h2>
                                </div>

                                {previewUrl ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-lg overflow-hidden">
                                            <Image
                                                src={previewUrl}
                                                alt="Certificate Preview"
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                        <p className="mt-3 text-sm text-gray-400">
                                            Preview of selected certificate
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                                        <FileText size={48} className="mb-3 opacity-50" />
                                        <p className="text-center">No certificate selected</p>
                                        <p className="text-xs mt-1 text-center">Upload a certificate to see preview</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        {/* <Card className="bg-[#121214] border-purple-800/40">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Upload Instructions</h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex items-start">
                                        <span className="text-purple-400 mr-2">•</span>
                                        Select the team and participant for the certificate
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-400 mr-2">•</span>
                                        Upload PNG, JPG, or PDF files (max 10MB)
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-400 mr-2">•</span>
                                        Certificates will be accessible via unique URLs
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-400 mr-2">•</span>
                                        Participants can verify their certificates anytime
                                    </li>
                                </ul>
                            </CardContent>
                        </Card> */}

                    </div>
                </div>
            </main>
        </div>
    );
}