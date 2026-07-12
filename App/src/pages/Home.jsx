import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// const FloatingOrb = ({ className }) => (
//   <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
// );

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group flex flex-col gap-2 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-white/10 transition-all duration-300 cursor-default">
    <span className="text-2xl">{icon}</span>
    <p className="text-sm font-semibold text-white/90">{title}</p>
    <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
  </div>
);

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0c1b] flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Background orbs */}
      {/* <FloatingOrb className="w-[500px] h-[500px] bg-indigo-600 -top-32 -left-32" />
      <FloatingOrb className="w-[400px] h-[400px] bg-violet-600 bottom-0 right-0" />
      <FloatingOrb className="w-[300px] h-[300px] bg-sky-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> */}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto transition-all duration-700 ${
          ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Badge with animated dot */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          AI-Powered Study Assistant
        </div>

        {/* Heading line */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
          Study{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
            smarter,
          </span>
          <br />
          not harder.
        </h1>

        {/* Subline */}
        <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-md mb-10">
          Your personal AI tutor that builds custom study plans, explains
          concepts, and tracks your progress — all in one place.
        </p>

        {/* Start Button container */}
        <button
          onClick={() => navigate("Login")} // this is link list###
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-100 transition-all duration-200"
        >
            <span>Start Studying</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {/* Glow ring */}
          <span className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400/0 group-hover:ring-indigo-400/40 transition-all duration-300" />
        </button>

        {/* <p className="mt-4 text-xs text-white/25">No sign-up required to explore</p> */}

        {/* Feature cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          <FeatureCard
            icon="🧠"
            title="AI Chat Tutor"
            desc="Ask anything — get clear, instant explanations tailored to your level."
          />
          <FeatureCard
            icon="📅"
            title="Smart Study Plans"
            desc="Auto-generated schedules built around your courses and deadlines."
          />
          {/* <FeatureCard
            icon="📋"
            title="Progress Tracking"
            desc="Keep tabs on tasks and past sessions so nothing slips through."
          /> */}
        </div>
      </div>
    </div>
  );
}

