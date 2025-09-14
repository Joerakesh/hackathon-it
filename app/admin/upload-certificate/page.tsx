"use client";

import { useState } from "react";
import Image from "next/image";

export default function UploadCertificatePage() {
    const [teamId, setTeamId] = useState("");
    const [memberId, setMemberId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus("❌ Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("teamId", teamId);
        formData.append("memberId", memberId);
        formData.append("file", file);

        try {
            const res = await fetch("/api/certificates/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setStatus(`✅ Certificate uploaded! Link: /certificate/${data.certificateId}`);
                setTeamId("");
                setMemberId("");
                setFile(null);
                setPreviewUrl(null);
            } else {
                setStatus(`❌ Error: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setStatus("❌ Upload failed");
        }
    };

    const handleFileChange = (file: File | null) => {
        setFile(file);
        if (file && file.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
                {/* Left - Upload Form */}
                <div className="bg-white shadow-md rounded-xl p-6 border">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">
                        📤 Upload Certificate
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                Team ID
                            </label>
                            <input
                                type="text"
                                value={teamId}
                                onChange={(e) => setTeamId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                Member Unique ID
                            </label>
                            <input
                                type="text"
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                Certificate File (PNG/JPG/PDF)
                            </label>
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                className="w-full text-sm text-gray-600"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-medium w-full"
                        >
                            Upload
                        </button>
                    </form>
                    {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
                </div>

                {/* Right - Preview */}
                <div className="bg-white shadow-md rounded-xl p-6 border flex items-center justify-center">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Certificate Preview"
                            width={600}
                            height={400}
                            className="rounded-lg border shadow-sm"
                        />
                    ) : (
                        <p className="text-gray-400 italic">No certificate selected</p>
                    )}
                </div>
            </div>
        </div>
    );
}
