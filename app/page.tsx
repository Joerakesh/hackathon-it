"use client";

import { useState, useEffect } from "react";
import { LuCalendar, LuUsers } from "react-icons/lu";
import { FaRegClock } from "react-icons/fa6";
import { MdOutlineLocationOn } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaTrophy, FaAward, FaMedal } from "react-icons/fa";
// Define types for background element properties
interface BackgroundElement {
  id: number;
  width: number;
  height: number;
  top: string;
  left: string;
  scale: number[];
  opacity: number[];
  duration: number;
  delay: number;
}

// Confetti particle interface
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  size: number;
  duration: number;
  delay: number;
  colors: string[];
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [expired, setExpired] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [backgroundElements, setBackgroundElements] = useState<BackgroundElement[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);

  // Format numbers with zero padding (09 instead of 9)
  const formatTime = (num: number) => String(num).padStart(2, "0");

  useEffect(() => {
    setIsClient(true);

    const eventDate = new Date("2025-09-16T16:15:00");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(timer);
        setExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });

        // ✅ Check if already played on this device
        const alreadyPlayed = localStorage.getItem("celebrationPlayed");
        if (!alreadyPlayed) {
          setCelebrationPlayed(true);
          setShowCelebration(true);

          // Generate confetti particles
          const particles: ConfettiParticle[] = [];
          for (let i = 0; i < 100; i++) {
            particles.push({
              id: i,
              x: Math.random() * 100,
              y: Math.random() * 100,
              angle: Math.random() * 360,
              size: Math.random() * 10 + 5,
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 0.5,
              colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
            });
          }
          setConfettiParticles(particles);

          // ✅ Save flag so it never blasts again
          localStorage.setItem("celebrationPlayed", "true");

          // Hide after 5s
          hideTimer = setTimeout(() => {
            setShowCelebration(false);
          }, 5000);
        }
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    }, 1000);

    let hideTimer: NodeJS.Timeout;

    return () => {
      clearInterval(timer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);
  // no changing deps
  // ✅ no dependency on showCelebration
  const submit = [
    "No PPT Needed",
    "Think out of the Box",
    "Be Creative",
    "Deploy if you can",
    "Clean code",
    // "Upload code in Git",
    // "Respect fellow participants and maintain fair play",
    // "No pre-built solutions or existing projects",
  ];

  const rules = ["Teams must consist of 1-3 members",
    "Students must bring their laptop",
    "All code must be original and created during the event",
    "Use of external APIs and libraries is allowed",
    "Projects must be submitted before the deadline",
    "Teams must present their solutions to judges",
    "Respect fellow participants and maintain fair play",
    "No pre-built solutions or existing projects",
  ]
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    visible: { transition: { staggerChildren: 0.1 } }
  };



  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-hidden">
      {/* Celebration Confetti Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-sm"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.colors[Math.floor(Math.random() * particle.colors.length)],
                rotate: particle.angle,
              }}
              initial={{ y: -100, opacity: 0 }}
              animate={{
                y: ["0%", "1000%"],
                opacity: [1, 0],
                x: Math.random() * 100 - 50,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Central Blast Effect */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-64 h-64 rounded-full bg-yellow-500 mix-blend-screen"
              initial={{ scale: 0 }}
              animate={{ scale: 10, opacity: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </motion.div>

          {/* Celebration Message */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center bg-black/70 p-8 rounded-2xl border-2 border-yellow-400 shadow-2xl">
              <motion.h2
                className="text-5xl font-bold text-yellow-400 mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 1 }}
              >
                🎉 TIME&apos;S UP! 🎉
              </motion.h2>
              <p className="text-xl text-white">The Hackathon Ends!</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="playfair-display text-[0.95rem] h-[12vh] flex flex-col justify-center items-center bg-black border-b border-gray-800"
      >
        <h1 className="text-[#5D829E]">Department of Information Technology</h1>
        <h1 className="text-[#5D829E]">
          St. Joseph&apos;s College (Autonomous), Tiruchirappalli
        </h1>
      </motion.header>

      {/* Rest of the component remains the same */}
      {/* Hero Section */}
      <section className="min-h-[88vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a1a] to-[#0f0f2d] text-center px-4 py-12 relative overflow-hidden">
        {/* Animated background elements - only render on client */}
        {isClient && (
          <div className="absolute inset-0 overflow-hidden">
            {backgroundElements.map((element) => (
              <motion.div
                key={element.id}
                className="absolute rounded-full bg-purple-900/10"
                style={{
                  width: element.width,
                  height: element.height,
                  top: element.top,
                  left: element.left,
                }}
                animate={{
                  scale: element.scale,
                  opacity: element.opacity,
                }}
                transition={{
                  duration: element.duration,
                  repeat: Infinity,
                  delay: element.delay,
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Hero Title */}
          <motion.h1
            variants={fadeIn}
            className="playfair-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white drop-shadow-lg mb-4"
          >
            Hackathon <span className="text-purple-500">&#39;25</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-xl md:text-2xl text-gray-300 mb-10 font-light tracking-wide"
          >
            Code. Create. Conquer.
          </motion.p>

          {/* Countdown Timer */}
          <motion.div variants={fadeIn} className="mb-12">
            {!expired ? (
              <>
                <h2 className="text-lg text-gray-300 mb-6">
                  Event ends in
                </h2>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-white">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((item, idx) => (
                    <div
                      key={item.label}
                      className="bg-[#111] px-4 py-4 rounded-xl border border-purple-900/40 shadow-lg min-w-[80px] backdrop-blur-sm"
                    >
                      <motion.p
                        key={item.value}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl md:text-3xl font-bold text-purple-400"
                        aria-label={`${item.value} ${item.label}`}
                      >
                        {formatTime(item.value)}
                      </motion.p>
                      <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-green-400 bg-green-900/20 px-6 py-3 rounded-lg inline-block"
              >
                🎉 The Hackathon has Ended!
              </motion.p>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/login">
              <button className="bg-[#222] hover:bg-purple-800/40 border border-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto">
                Team Leader Login
              </button>
            </Link>
          </motion.div>
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSe4BhYU8xQqhjTp0zncA3XQ99VBJf65ptG3B--1_0IZCe2SgQ/viewform?usp=dialog">
              <button className="bg-[#222] hover:bg-purple-800/40 border border-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto">
                Code Submission
              </button>
            </Link>
          </motion.div>

          <motion.p variants={fadeIn} className="playfair-display text-sm md:text-base text-center text-red-300 bg-blue-900/20 px-4 py-2 rounded-lg border border-red-500/30 inline-block">
            Powered by JWS Technologies
          </motion.p>
        </motion.div>
      </section>

      {/* About */}
      <section className="py-20 bg-[#0a0a0a]">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="playfair-display text-4xl text-center font-semibold mb-12"
        >
          About The Event
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-center px-4"
        >
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#111] to-[#1a1a2e] text-center p-8 rounded-2xl border border-purple-900/40 shadow-xl">
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              We, the{" "}
              <span className="font-semibold text-purple-400">
                Department of Information Technology
              </span>{" "}
              at{" "}
              <span className="font-semibold text-purple-400">St. Joseph&apos;s College</span>,
              are thrilled to announce our upcoming Hackathon on{" "}
              <span className="text-purple-400 font-semibold">
                16th September 2025
              </span>
              . Get ready for innovation, collaboration, and creativity where
              brilliant minds converge to push the boundaries of technology.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Event Details */}
      <section className="py-20 bg-[#0f0f0f]">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="playfair-display text-4xl text-center font-semibold mb-12"
        >
          Event Details
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center justify-center px-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
            {[
              {
                icon: (
                  <LuCalendar
                    size={40}
                    className="mx-auto mb-4 text-purple-400"
                  />
                ),
                title: "Date",
                main: "16th September",
                sub: "Starts 9:30 AM",
              },
              {
                icon: (
                  <FaRegClock
                    size={40}
                    className="mx-auto mb-4 text-purple-400"
                  />
                ),
                title: "Duration",
                main: "6 Hours",
                sub: "Non-stop coding",
              },
              {
                icon: (
                  <MdOutlineLocationOn
                    size={40}
                    className="mx-auto mb-4 text-purple-400"
                  />
                ),
                title: "Venue",
                main: "College Campus",
                sub: "St. Joseph's College",
              },
              {
                icon: (
                  <LuUsers size={40} className="mx-auto mb-4 text-purple-400" />
                ),
                title: "Team Size",
                main: "1-3 Members",
                sub: "Collaborate & create",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gradient-to-b from-[#111] to-[#1a1a2e] border border-purple-900/40 rounded-2xl p-6 text-center shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
              >
                {item.icon}
                <h3 className="playfair-display text-lg font-semibold text-gray-200 mb-2">
                  {item.title}
                </h3>
                <p className="text-2xl font-bold text-purple-400">
                  {item.main}
                </p>
                <p className="text-sm text-gray-400 mt-1">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
      {/* Prizes & Recognition */}
      <section className="py-20 bg-[#0f0f0f]">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="playfair-display text-4xl text-center font-semibold mb-12"
        >
          Prizes & Recognition
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center justify-center px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {/* First Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-[#111] to-[#1a1a2e] border border-purple-900/40 rounded-2xl p-6 text-center shadow-lg hover:shadow-purple-900/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-500/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <FaTrophy className="text-4xl text-yellow-400" />
                </div>
                <h3 className="playfair-display text-2xl font-bold text-yellow-400 mb-2">
                  1st Place
                </h3>
                <h4 className="text-lg font-semibold text-white mb-4">Grand Prize</h4>
                <div className="space-y-2 text-gray-200">
                  <p className="flex items-center justify-center gap-2">
                    {/* <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> */}
                    ₹2000 + Shield
                  </p>

                  <p className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Certificate Included
                  </p>


                </div>
              </div>
            </motion.div>

            {/* Second Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-[#111] to-[#1a1a2e] border border-purple-900/40 rounded-2xl p-6 text-center shadow-lg hover:shadow-purple-900/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gray-400/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <FaMedal className="text-4xl text-gray-300" />
                </div>
                <h3 className="playfair-display text-2xl font-bold text-gray-300 mb-2">
                  2nd Place
                </h3>
                <h4 className="text-lg font-semibold text-white mb-4">Runner Up</h4>
                <div className="space-y-2 text-gray-200">
                  <p className="flex items-center justify-center gap-2">
                    {/* <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> */}
                    ₹1000 + Shield
                  </p>

                  <p className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Certificate Included
                  </p>


                </div>
              </div>
            </motion.div>

            {/* Third Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-[#111] to-[#1a1a2e] border border-purple-900/40 rounded-2xl p-6 text-center shadow-lg hover:shadow-purple-900/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-700/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <FaAward className="text-4xl text-amber-600" />
                </div>
                <h3 className="playfair-display text-2xl font-bold text-amber-600 mb-2">
                  3rd Place
                </h3>
                <h4 className="text-lg font-semibold text-white mb-4">Third Place</h4>
                <div className="space-y-2 text-gray-200">
                  <p className="flex items-center justify-center gap-2">
                    {/* <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> */}
                    ₹750 + Shield
                  </p>

                  <p className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Certificate Included
                  </p>


                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center max-w-3xl mx-auto px-4"
        >
          <p className="text-gray-400 italic">
            All participants will receive certificates of participation today itself.
          </p>
        </motion.div>
      </section>

      {/* Rules */}
      <section className="py-20 bg-[#0a0a0a]">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="playfair-display text-4xl text-center font-semibold mb-12"
        >
          Rules & Guidelines
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center justify-center px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl w-full">
            {rules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 bg-gradient-to-b from-[#111] to-[#1a1a2e] border border-purple-900/40 rounded-2xl p-5 shadow-md hover:shadow-purple-900/20 transition-all duration-300"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-500 text-purple-400 font-semibold text-sm flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-gray-200 text-left">{rule}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Submit */}
      <section className="py-20 bg-[#0a0a0a]">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="playfair-display text-4xl text-center font-semibold mb-12"
        >
          Submission Guidelines
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center justify-center px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl w-full">
            {submit.map((sub, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 bg-gradient-to-b from-[#111] to-[#1a1a2e] border border-purple-900/40 rounded-2xl p-5 shadow-md hover:shadow-purple-900/20 transition-all duration-300"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-500 text-purple-400 font-semibold text-sm flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-gray-200 text-left">{sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="playfair-display text-purple-400 font-semibold text-lg mb-4">
              Contact Information
            </h3>
            <a
              className="font-semibold flex items-center justify-center sm:justify-start gap-2 mb-3 hover:text-purple-300 transition-colors"
              href="mailto:hackathon@jwstechnologies.com"
            >
              <IoMailOutline size={18} className="text-purple-400" />
              hackathon@jwstechnologies.com
            </a>
            <a
              className="font-semibold flex items-center justify-center sm:justify-start gap-2 hover:text-purple-300 transition-colors"
              href="tel:+916385266784"
            >
              <BsTelephone size={18} className="text-purple-400" />
              +91 63852 66784
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="sm:text-center"
          >
            <h3 className="playfair-display text-purple-400 font-semibold text-lg mb-4">
              Department of IT
            </h3>
            <p>St. Joseph&apos;s College (Autonomous)</p>
            <p>Tiruchirappalli - 620 002</p>
            <p>Tamil Nadu, India</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="sm:text-right"
          >
            <h3 className="playfair-display text-purple-400 font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-2">
              <Link href="/registration" className="hover:text-purple-300 transition-colors">
                Registration
              </Link>
              <Link href="/login" className="hover:text-purple-300 transition-colors">
                Team Login
              </Link>
              <a href="#rules" className="hover:text-purple-300 transition-colors">
                Rules & Guidelines
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-400"
        >
          © 2025 Department of Information Technology, St. Joseph&apos;s
          College. All rights reserved.
          <br />
          <a
            href="https://jwstechnologies.com"
            target="_blank"
            className="hover:text-purple-300 transition-colors"
          >
            JWS Technologies - Tech Support
          </a>
        </motion.div>
      </footer>
    </div>
  );
}