"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LuCalendar,
  LuUsers,
} from "react-icons/lu";
import { FaRegClock } from "react-icons/fa6";
import { MdOutlineLocationOn } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";
import Link from "next/link";

/* ------------------ DATA ------------------ */

const participationDetails = [
  "Individual Participation Only",
  "Maximum 5 Participants per Department",
  "Maximum 20 Participants per College",
  "Entry Fee: ₹250 per participant",
  "Food & Snacks will be provided",
  "Participation Certificate for ALL participants",
];

const levels = [
  {
    level: "Level 1 – Prelims",
    language: "C",
    questions: 20,
    time: "20 Minutes",
    flow: "500 → 100",
  },
  {
    level: "Level 2 – Intermediate",
    language: "C",
    questions: 15,
    time: "20 Minutes",
    flow: "100 → 50",
  },
  {
    level: "Level 3 – Advanced",
    language: "Python",
    questions: 15,
    time: "20 Minutes",
    flow: "50 → 25",
  },
  {
    level: "Level 4 – Expert",
    language: "Java",
    questions: 20,
    time: "30 Minutes",
    flow: "25 → 7",
  },
  {
    level: "Level 5 – Final Round",
    language: "Java",
    questions: 20,
    time: "45 Minutes",
    flow: "Finalists: 7",
  },
];

const prizes = [
  { place: "1st Prize", amount: "₹5,000" },
  { place: "2nd Prize", amount: "₹3,000" },
  { place: "3rd Prize", amount: "₹2,000" },
  { place: "4th Prize", amount: "₹1,000" },
];

const rules = [
  "No Internet / Mobile Phones allowed",
  "No Smart Watches or External Devices",
  "Malpractice leads to Immediate Disqualification",
  "Judges’ decision is final",
];

/* ------------------ COMPONENT ------------------ */

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const eventDate = new Date("2026-02-06T09:00:00");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = eventDate.getTime() - now;

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">

      {/* HEADER */}
      <header className="text-center py-6 border-b border-gray-800 bg-black">
        <h1 className="text-xl font-semibold text-purple-400">
          SACRED HEART COLLEGE (AUTONOMOUS)
        </h1>
        <p className="text-sm text-gray-400">
          Tirupattur – 635 601 | NAAC A++ (CGPA 3.53 / 4)
        </p>
        <p className="text-sm text-gray-300 mt-1">
          Department of Computer Science
        </p>
      </header>

      {/* HERO */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-7xl font-extrabold mb-4"
        >
          GLITCH FIX
        </motion.h1>

        <p className="text-xl text-gray-300 mb-10">
          Level-Wise Competitive Programming Event
        </p>

        {/* COUNTDOWN */}
        <div className="flex gap-4 mb-12">
          {[
            { label: "Days", v: timeLeft.days },
            { label: "Hours", v: timeLeft.hours },
            { label: "Minutes", v: timeLeft.minutes },
            { label: "Seconds", v: timeLeft.seconds },
          ].map((t) => (
            <div
              key={t.label}
              className="bg-[#111] px-5 py-4 rounded-xl border border-purple-900/40"
            >
              <p className="text-2xl font-bold text-purple-400">
                {format(t.v)}
              </p>
              <p className="text-xs text-gray-400">{t.label}</p>
            </div>
          ))}
        </div>

        <Link href="/registration">
          <button className="bg-purple-700 hover:bg-purple-800 px-8 py-3 rounded-lg font-semibold">
            Register Now
          </button>
        </Link>
        <Link href="/login">
          <button className="mt-5 bg-purple-700 hover:bg-purple-800 px-8 py-3 rounded-lg font-semibold">
            Login
          </button>
        </Link>
      </section>

      {/* EVENT DETAILS */}
      <section className="py-20 bg-[#0f0f0f]">
        <h2 className="text-4xl text-center mb-12 font-semibold">
          Event Details
        </h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          {[
            { icon: <LuCalendar />, title: "Date", value: "February 6" },
            { icon: <FaRegClock />, title: "Mode", value: "Offline" },
            { icon: <MdOutlineLocationOn />, title: "Venue", value: "Sacred Heart College" },
            { icon: <LuUsers />, title: "Participation", value: "Individual" },
          ].map((i, idx) => (
            <div
              key={idx}
              className="bg-[#111] border border-purple-900/40 p-6 rounded-xl text-center"
            >
              <div className="text-purple-400 text-3xl mb-3 flex justify-center">
                {i.icon}
              </div>
              <h3 className="font-semibold">{i.title}</h3>
              <p className="text-gray-400">{i.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARTICIPATION */}
      <section className="py-20">
        <h2 className="text-4xl text-center mb-12 font-semibold">
          Participation Details
        </h2>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto px-4">
          {participationDetails.map((p, i) => (
            <div
              key={i}
              className="bg-[#111] border border-purple-900/40 p-5 rounded-xl"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* LEVELS */}
      <section className="py-20 bg-[#0f0f0f]">
        <h2 className="text-4xl text-center mb-12 font-semibold">
          Level-Wise Structure
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
          {levels.map((l, i) => (
            <div
              key={i}
              className="bg-[#111] border border-purple-900/40 p-6 rounded-xl"
            >
              <h3 className="text-xl font-semibold text-purple-400 mb-2">
                {l.level}
              </h3>
              <p>Language: {l.language}</p>
              <p>Questions: {l.questions}</p>
              <p>Time: {l.time}</p>
              <p className="text-gray-400">{l.flow}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIZES */}
      <section className="py-20">
        <h2 className="text-4xl text-center mb-12 font-semibold">
          Prize Money
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
          {prizes.map((p, i) => (
            <div
              key={i}
              className="bg-[#111] border border-purple-900/40 p-6 rounded-xl text-center"
            >
              <h3 className="text-xl font-semibold text-purple-400">
                {p.place}
              </h3>
              <p className="text-2xl font-bold">{p.amount}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RULES */}
      <section className="py-20 bg-[#0f0f0f]">
        <h2 className="text-4xl text-center mb-12 font-semibold">
          Important Rules
        </h2>

        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {rules.map((r, i) => (
            <div
              key={i}
              className="bg-[#111] border border-purple-900/40 p-4 rounded-xl"
            >
              {r}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-gray-800 py-10 text-center text-gray-400">
        <p>Student Coordinator:</p>
        <p>Staff Coordinator:</p>

        <div className="mt-4 flex justify-center gap-6">
          <a href="mailto:example@gmail.com" className="flex items-center gap-2">
            <IoMailOutline /> example@gmail.com
          </a>
          <a href="tel:+91XXXXXXXXXX" className="flex items-center gap-2">
            <BsTelephone /> +91 XXXXXXXXXX
          </a>
        </div>

        <p className="mt-6 text-sm">
          © 2026 Sacred Heart College (Autonomous)
        </p>
      </footer>
    </div>
  );
}
