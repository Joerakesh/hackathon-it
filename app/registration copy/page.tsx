"use client"
import React, { useState } from 'react'
import { useRouter } from "next/navigation";
import { LuUsers, LuUser, LuArrowRight, LuArrowLeft, LuLoader } from "react-icons/lu";
import { LuEye, LuEyeOff } from "react-icons/lu";

interface TeamMember {
    name: string;
    email: string;
    phoneNumber: string;
}



const TeamRegistration: React.FC = () => {
    const router = useRouter();
    // Form state
    const [step, setStep] = useState<number>(1);
    const [teamLeader, setTeamLeader] = useState({
        name: "",
        college: "",
        department: "",
        city: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        teamSize: 1,
    });
    const [loading, setLoading] = useState<boolean>(false);

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const registrationFeePerPerson = 200; // ₹200 per person
    // const totalAmount = (teamLeader.teamSize) * registrationFeePerPerson;

    // Handle team leader form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTeamLeader(prev => ({
            ...prev,
            [name]: name === 'teamSize' ? parseInt(value) : value
        }));
    };

    // Handle team member input changes
    const handleMemberInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedMembers = [...teamMembers];
        updatedMembers[index] = {
            ...updatedMembers[index],
            [name]: value
        };
        setTeamMembers(updatedMembers);
    };

    // Handle form submission
    // Handle form submission

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            if (teamLeader.password !== teamLeader.confirmPassword) {
                alert("❌ Passwords do not match");
                return;
            }
            // Generate empty team member objects based on team size
            const members = Array.from({ length: teamLeader.teamSize - 1 }, (): TeamMember => ({
                name: "",
                email: "",
                phoneNumber: "",
            }));
            setTeamMembers(members);
            setStep(2);
        } else {
            setLoading(true);
            // Final submission
            const finalTeamSize = teamMembers.length + 1;
            const payload = {
                teamLeader: {
                    name: teamLeader.name,
                    college: teamLeader.college,
                    city: teamLeader.city,
                    department: teamLeader.department,
                    phoneNumber: teamLeader.phoneNumber,
                    email: teamLeader.email,
                    password: teamLeader.password,
                    confirmPassword: teamLeader.confirmPassword,
                    teamSize: teamMembers.length + 1,
                },
                teamMembers,
                payment: {
                    amount: finalTeamSize * registrationFeePerPerson,
                    status: "pending",
                    updatedAt: new Date()
                }

            };

            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    alert("✅ Registration successful! Check your email, if not recieved check in SPAM.");
                    router.push("/login");
                } else {
                    alert("❌ Something went wrong.");
                }
            } catch (err) {
                console.error(err);
                alert("⚠️ Error connecting to server.");
            }
        }
    };


    // Go back to previous step
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-6">
            <div className="bg-[#111] rounded-2xl shadow-lg p-8 w-full max-w-lg border border-gray-800">
                {/* Progress indicator */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                            <span className="text-white text-sm">1</span>
                        </div>
                        <div className={`h-1 w-12 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                            <span className="text-white text-sm">2</span>
                        </div>
                    </div>
                    <div className="text-sm text-gray-400">
                        Step {step} of 2
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    {step === 1 ? (
                        <LuUsers size={40} className="text-purple-500 mb-3" />
                    ) : (
                        <LuUser size={40} className="text-purple-500 mb-3" />
                    )}
                    <h2 className="text-2xl font-playfair font-semibold text-white text-center">
                        {step === 1 ? 'Team Leader Details' : 'Team Members Details'}
                    </h2>
                    <p className="text-gray-400 text-sm text-center">
                        {step === 1 ? 'Enter the team leader information' : `Add details for ${teamLeader.teamSize - 1} team member${teamLeader.teamSize - 1 !== 1 ? 's' : ''}`}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                        // Team Leader Form
                        <>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={teamLeader.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    College/Institution *
                                </label>
                                <input
                                    type="text"
                                    name="college"
                                    value={teamLeader.college}
                                    onChange={handleInputChange}
                                    placeholder="Enter your college name"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    Department *
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={teamLeader.department}
                                    onChange={handleInputChange}
                                    placeholder="Enter your department name"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    City/Place *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={teamLeader.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter your city"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={teamLeader.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={teamLeader.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email address"
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
                                    name="password"
                                    value={teamLeader.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 pr-10 focus:outline-none focus:border-purple-500"
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

                            <div className="relative">
                                <label className="block text-sm font-medium text-white mb-1">
                                    Confirm Password *
                                </label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={teamLeader.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm password"
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 pr-10 focus:outline-none focus:border-purple-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-11 right-3 flex items-center text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    Total Team Size *
                                </label>
                                <select
                                    name="teamSize"
                                    value={teamLeader.teamSize}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none appearance-none"
                                    required
                                >
                                    <option value={1}>1 Member (Solo)</option>
                                    <option value={2}>2 Members</option>
                                    <option value={3}>3 Members</option>
                                    <option value={4}>4 Members</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        // Team Members Form
                        <>
                            {teamMembers.map((member, index) => (
                                <div key={index} className="border border-gray-700 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3">Team Member {index + 1}</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={member.name}
                                                onChange={(e) => handleMemberInputChange(index, e)}
                                                placeholder="Enter member's full name"
                                                className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-1">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={member.email}
                                                onChange={(e) => handleMemberInputChange(index, e)}
                                                placeholder="Enter member's email address"
                                                className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={member.phoneNumber}
                                                onChange={(e) => handleMemberInputChange(index, e)}
                                                placeholder="Enter member's phone number"
                                                className="w-full rounded-lg bg-black border border-gray-700 text-white px-4 py-2 focus:outline-none focus:border-purple-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Buttons */}
                    <div className={`flex ${step === 1 ? 'justify-end' : 'justify-between'} mt-6`}>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                                disabled={loading}
                            >
                                <LuArrowLeft className="mr-2" />
                                Back
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg transition 
                        ${loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} text-white`}
                        >
                            {loading ? (
                                <>
                                    <LuLoader className="animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {step === 1 ? 'Next' : 'Complete Registration'}
                                    <LuArrowRight className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Team Size Info */}
                {step === 1 && (
                    <div className="mt-6 p-4 bg-purple-900/20 rounded-lg">
                        <p className="text-purple-300 text-sm">
                            <span className="font-semibold">Selected Team Size:</span> {teamLeader.teamSize} member{teamLeader.teamSize > 1 ? 's' : ''}
                        </p>
                        {teamLeader.teamSize > 1 && (
                            <p className="text-purple-200 text-xs mt-2">
                                After submitting, you&apos;ll be asked to enter details for your {teamLeader.teamSize - 1} team member{teamLeader.teamSize > 2 ? 's' : ''}.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamRegistration;