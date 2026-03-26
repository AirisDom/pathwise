"use client";

import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import PublicNav from "@/components/layout/PublicNav";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Monitor,
  Sparkle,
  Star,
  TrendUp,
  UploadSimple,
  Users,
  Video,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════
// Page
// ═══════════════════════════════════════

export default function TeachPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 text-white pt-32 pb-24">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-blue-100">Join our growing creator community</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Share What You Know.
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-indigo-300">
              Inspire the World.
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            PathWise gives you everything you need to create, publish, and grow your online courses — completely free. No experience required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-900/40"
            >
              Start Teaching Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg transition-colors border border-white/20"
            >
              Browse Courses First
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-blue-600 text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "Free", label: "Always free to teach" },
              { value: "100%", label: "Creative control" },
              { value: "Lumi AI", label: "Helps your students" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-extrabold mb-1">{stat.value}</p>
                <p className="text-sm text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From idea to live course in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-0.5 bg-linear-to-r from-blue-200 via-blue-400 to-blue-200" />

            {[
              {
                step: "01",
                icon: Lightbulb,
                title: "Plan Your Course",
                desc: "Define your topic, learning outcomes, and audience. Our structured course editor walks you through every detail.",
                color: "bg-amber-100 text-amber-600",
              },
              {
                step: "02",
                icon: UploadSimple,
                title: "Record & UploadSimple",
                desc: "UploadSimple your video lessons with our drag-and-drop uploader. Add sections, quizzes, and resources to build a complete learning experience.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                step: "03",
                icon: TrendUp,
                title: "Publish & Grow",
                desc: "Hit publish and your course goes live instantly. Track students, views, ratings, and completion rates from your analytics dashboard.",
                color: "bg-emerald-100 text-emerald-600",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="relative bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold items-center justify-center shadow-sm">
                    {step.step}
                  </span>
                </div>
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${step.color}`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PathWise ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Why Creators Choose PathWise
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Built for educators who care about quality and simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                color: "bg-blue-600",
                title: "Reach Learners Worldwide",
                desc: "Your courses are discoverable by anyone on PathWise. Students from any background can find, enroll, and learn from you — no geography required.",
              },
              {
                icon: Monitor,
                color: "bg-indigo-600",
                title: "Full Creative Control",
                desc: "Structure your course your way. Add sections, lessons (video, text, quiz), resources, and prerequisites. Your knowledge, your format.",
              },
              {
                icon: Sparkle,
                color: "bg-emerald-600",
                title: "Lumi AI Supports Your Students",
                desc: "Every course comes with Lumi, our AI study assistant. Lumi answers student questions about your course content in real time — so you don't have to.",
              },
              {
                icon: BookOpen,
                color: "bg-purple-600",
                title: "Completely Free, Forever",
                desc: "No fees, no percentage cuts, no paywalls. PathWise is an open platform — create as many courses as you like without spending a cent.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-16 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed mb-6 italic">
            "I published my first course on PathWise in a weekend. Within a month I had students from three different countries learning from me. The platform just gets out of your way and lets you teach."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Sarah K.</p>
              <p className="text-xs text-gray-500">Web Development Creator</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you get checklist ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-500 mb-10">No plugins. No extensions. Just PathWise.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {[
              "Drag-and-drop video uploader",
              "Multi-section course builder",
              "Student analytics dashboard",
              "Real-time ratings & reviews",
              "Lumi AI assistant for students",
              "Email verification flow",
              "Course thumbnail uploads",
              "Creator profile page",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <Video className="w-12 h-12 text-blue-300 mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Ready to start teaching?
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-lg mx-auto">
            Join PathWise today — create your account, build your first course, and share your knowledge with the world.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold rounded-xl text-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-xl"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-5 text-sm text-blue-300">No credit card required. Free forever.</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
