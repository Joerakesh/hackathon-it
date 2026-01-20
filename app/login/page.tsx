"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuLogIn } from "react-icons/lu";
import { LuEye, LuEyeOff } from "react-icons/lu";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
            } else {
                // Save team info (optional, since token is in cookie)
                localStorage.setItem("participant", JSON.stringify(data.participant));
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };


    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-6">
            <div className="bg-[#111] rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-800">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <LuLogIn size={40} className="text-purple-500 mb-3" />
                    <h2 className="text-2xl font-playfair font-semibold text-white text-center">
                        Team Login
                    </h2>
                    <p className="text-gray-400 text-sm text-center">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>


                    <div className="relative">
                        <label className="block text-sm font-medium text-white mb-1">
                            Password *
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-11 right-3 flex items-center text-gray-400 hover:text-white"
                        >
                            {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    <p className="text-sm text-gray-400 text-center mt-4">
                        Not registered yet?{" "}
                        <a
                            href="/registration"
                            className="text-purple-400 hover:text-purple-500 font-medium transition-colors"
                        >
                            Click here
                        </a>
                    </p>

                </form>

            </div>
        </div>
    );
}
