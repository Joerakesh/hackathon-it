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
                {/* <div className="flex justify-between items-center mb-8">
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
                </div> */}

                {/* Header */}
                <div className="flex flex-col items-center mb-6">

                    <LuUser size={40} className="text-purple-500 mb-3" />

                    <h2 className="text-2xl font-playfair font-semibold text-white text-center">
                        Registration Closed
                    </h2>

                </div>

                {/* Form */}


                {/* Team Size Info */}
                <p className="text-sm text-gray-400 text-center mt-4">
                    if already registered?{" "}
                    <a
                        href="/login"
                        className="text-purple-400 hover:text-purple-500 font-medium transition-colors"
                    >
                        Click here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default TeamRegistration;