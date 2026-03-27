"use client";

import Link from "next/link";
import { Sparkle, ChatCircle, TrendUp, ArrowRight } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const lumiFeatures: {
  Icon: Icon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}[] = [
  {
    Icon: Sparkle,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    title: "Personalised Learning Paths",
    description:
      "Lumi analyses your goals and skill level to build a custom curriculum just for you.",
  },
  {
    Icon: ChatCircle,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "Ask Anything, Anytime",
    description:
      "Stuck on a concept? Lumi answers your questions instantly — no waiting for a forum reply.",
  },
  {
    Icon: TrendUp,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    title: "Progress & Insights",
    description:
      "Lumi tracks where you excel and where you need practice, so you never waste time.",
  },
];

const chatMessages = [
  {
    role: "user",
    text: "I want to become a data scientist. Where do I start?",
  },
  {
    role: "lumi",
    text: "Great goal! I'd suggest starting with Python fundamentals, then moving into statistics and data analysis with pandas. I've built you a 12-week learning path — want to see it?",
  },
  { role: "user", text: "Yes, show me!" },
  {
    role: "lumi",
    text: "Week 1–3: Python basics & functions. Week 4–6: Data analysis with pandas & NumPy. Week 7–9: Data visualisation. Week 10–12: Machine learning fundamentals. Ready to begin?",
  },
];

export default function HomeLumiSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              <Sparkle className="w-3.5 h-3.5" weight="fill" /> Meet Lumi
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Your AI learning companion,{" "}
              <span className="text-emerald-600">built to get you there</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              Lumi is PathWise's intelligent AI assistant — always available,
              always personalised. Whether you need a study plan, a concept
              explained, or a nudge to keep going, Lumi has you covered.
            </p>

            <ul className="mt-8 space-y-5">
              {lumiFeatures.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.iconBg}`}>
                    <f.Icon className={`w-5 h-5 ${f.iconColor}`} weight="fill" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{f.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {f.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Start learning with Lumi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right — Chat mockup */}
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-50 rounded-3xl -z-10" />
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  L
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lumi</p>
                  <p className="text-xs text-emerald-500">Online — always ready</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "lumi" && (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                        L
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
                  <p className="text-sm text-gray-400 flex-1">
                    Ask Lumi anything…
                  </p>
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
