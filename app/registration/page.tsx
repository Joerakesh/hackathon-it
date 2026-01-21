"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    LuUser,
    LuArrowRight,
    LuLoader,
} from "react-icons/lu";
import { IoMailOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";

const IndividualRegistration: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        college: "",
        department: "",
        city: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const registrationFee = 250;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            setLoading(false);
            return;
        }

        const payload = {
            ...form,
            event: "GLITCH FIX",
            participationType: "Individual",
            payment: {
                amount: registrationFee,
                status: "pending",
                updatedAt: new Date(),
            },
            createdAt: new Date(),
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.status === 201) {
                alert("✅ Registration successful!");
                router.push("./login")
            }
            else if (res.status === 409) {
                alert("⚠️ You have already registered for GLITCH FIX.");
            }
            else {
                alert("❌ Something went wrong. Try again.");
            }
        } catch (err) {
            console.error(err);
            alert("⚠️ Server error. Try later.");
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
                        GLITCH FIX – Registration
                    </h2>
                    <p className="text-gray-400 text-sm text-center mt-1">
                        Individual Participation Only
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-white">Full Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white">College *</label>
                        <input
                            name="college"
                            value={form.college}
                            onChange={handleChange}
                            placeholder="Enter your college"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white">Department *</label>
                        <input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            placeholder="Enter your department"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white">City *</label>
                        <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Enter your city"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white flex items-center gap-2">
                            <BsTelephone /> Phone Number *
                        </label>
                        <input
                            name="phoneNumber"
                            type="tel"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white flex items-center gap-2">
                            <IoMailOutline /> Email *
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white">Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white">Confirm Password *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Enter your confirm password"
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>


                    {/* Fee Info */}
                    <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4 text-sm text-purple-300">
                        Registration Fee: <span className="font-semibold">₹250</span>
                        <br />
                        Food & Snacks Included
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center py-3 rounded-lg text-white transition
              ${loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"}
            `}
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
        </div>
    );
};

export default IndividualRegistration;
