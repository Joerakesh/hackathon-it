"use client";

import { useState } from "react";

export default function UploadGalleryPage() {
    const [teamId, setTeamId] = useState("");
    const [galleryLink, setGalleryLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId, folderUrl: galleryLink }),
            });


            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Gallery link uploaded successfully!");
                setGalleryLink("");
            } else {
                setMessage(`❌ Error: ${data.error || "Failed to upload"}`);
            }
        } catch (err) {
            setMessage("❌ Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
            <h1 className="text-xl font-semibold mb-6 text-purple-400">
                Upload Gallery Link
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Team ID</label>
                    <input
                        type="text"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        required
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-purple-400"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Gallery Link</label>
                    <input
                        type="url"
                        value={galleryLink}
                        onChange={(e) => setGalleryLink(e.target.value)}
                        required
                        placeholder="https://drive.google.com/..."
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-purple-400"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </form>

            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    );
}
