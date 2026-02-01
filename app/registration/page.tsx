"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuUser, LuArrowRight, LuLoader } from "react-icons/lu";
import { IoMailOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";

const TeamRegistration: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        leader: {
            name: "",
            college: "",
            department: "",
            city: "",
            phoneNumber: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        member: {
            name: "",
            phoneNumber: "",
            email: "",
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        section: "leader" | "member",
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (form.leader.password !== form.leader.confirmPassword) {
            alert("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.status === 201) {
                alert("✅ Team registered successfully!");
                router.push("/login");
            } else if (res.status === 409) {
                alert("⚠️ Leader already registered");
            } else {
                const err = await res.json();
                alert(err.error || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-6">
            <div className="bg-[#111] rounded-2xl p-8 w-full max-w-lg border border-gray-800">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <LuUser size={40} className="text-purple-500 mb-3" />
                    <h2 className="text-2xl font-semibold text-white">
                        GLITCH FIX – Team Registration
                    </h2>
                    <p className="text-gray-400 text-sm text-center mt-1">
                        Solo or Team of 2 (Leader mandatory)
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* LEADER SECTION */}
                    <h3 className="text-white text-lg font-semibold">Team Leader</h3>

                    <input
                        name="name"
                        placeholder="Leader Full Name *"
                        value={form.leader.name}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="college"
                        placeholder="College *"
                        value={form.leader.college}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="department"
                        placeholder="Department *"
                        value={form.leader.department}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="city"
                        placeholder="City *"
                        value={form.leader.city}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="phoneNumber"
                        placeholder="Leader Phone *"
                        value={form.leader.phoneNumber}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Leader Email *"
                        value={form.leader.email}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password *"
                        value={form.leader.password}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password *"
                        value={form.leader.confirmPassword}
                        onChange={(e) => handleChange(e, "leader")}
                        required
                        className="input"
                    />

                    {/* MEMBER SECTION */}
                    <h3 className="text-white text-lg font-semibold mt-6">
                        Team Member
                    </h3>

                    <input
                        name="name"
                        placeholder="Member Full Name"
                        value={form.member.name}
                        onChange={(e) => handleChange(e, "member")}
                        // required
                        className="input"
                    />

                    <input
                        name="phoneNumber"
                        placeholder="Member Phone"
                        value={form.member.phoneNumber}
                        onChange={(e) => handleChange(e, "member")}
                        // required
                        className="input"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Member Email"
                        value={form.member.email}
                        onChange={(e) => handleChange(e, "member")}
                        // required
                        className="input"
                    />

                    {/* Fee Info */}
                    <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4 text-sm text-purple-300">
                        Registration Fee: <b>₹300</b>
                        <br />
                        Covers entire team
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center py-3 rounded-lg text-white transition ${loading
                            ? "bg-purple-400"
                            : "bg-purple-600 hover:bg-purple-700"
                            }`}
                    >
                        {loading ? (
                            <>
                                <LuLoader className="animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Complete Registration
                                <LuArrowRight className="ml-2" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Reusable input style */}
            <style jsx>{`
        .input {
          width: 100%;
          background: black;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          color: white;
        }
      `}</style>
        </div>
    );
};

export default TeamRegistration;
