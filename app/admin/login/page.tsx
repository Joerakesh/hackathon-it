"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuLogIn, LuEye, LuEyeOff } from "react-icons/lu";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Static admin credentials
        const adminEmail = "admin@jwstechnologies.com";
        const adminPassword = "1234";

        setTimeout(() => {
            if (email === adminEmail && password === adminPassword) {
                // Store a simple flag in localStorage for session simulation
                localStorage.setItem("adminLoggedIn", "true");
                router.push("/admin-dashboard");
            } else {
                setError("Invalid email or password");
            }
            setLoading(false);
        }, 500); // simulate network delay
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] p-4">
            <form
                onSubmit={handleLogin}
                className="bg-[#121214] p-6 rounded-lg shadow-lg w-full max-w-md text-white space-y-4"
            >
                <h2 className="text-2xl font-bold text-purple-400 text-center mb-4">
                    Admin Login
                </h2>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex flex-col">
                    <label className="text-gray-300 text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 rounded bg-black border border-purple-800 text-white"
                        placeholder="admin@jwstechnologies.com"
                        required
                    />
                </div>

                <div className="flex flex-col relative">
                    <label className="text-gray-300 text-sm mb-1">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 rounded bg-black border border-purple-800 text-white pr-10"
                        placeholder="Enter password"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-9 text-gray-400 hover:text-purple-400"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-700 hover:bg-purple-600 p-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <LuLogIn />
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
