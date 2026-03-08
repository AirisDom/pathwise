"use client";
import Link from "next/link";
import PublicNav from "@/components/layout/PublicNav";
import { Footer2 } from "@/components/ui/footer2";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Heart,
  Lightbulb,
  ShieldCheck,
  Sparkle,
  Users,
  Lightning,
} from "@phosphor-icons/react";


const VALUES = [
  {
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    title: "Learning First",
    desc: "Every decision we make starts with one question: does this help students learn better? We build tools that get out of the way and let knowledge flow.",
  },
  {
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
    title: "Radical Openness",
    desc: "We believe the best education should have no price tag. PathWise is free for every student, every creator, in every country — always.",
  },
  {
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600",
    title: "Creator Empowerment",
    desc: "We give teachers and domain experts the tools to package their expertise into structured courses without needing a marketing budget or tech skills.",
  },
  {
    icon: Sparkle,
    color: "bg-emerald-100 text-emerald-600",
    title: "AI-Augmented Learning",
    desc: "Lumi, our AI study assistant, brings personalised support to every learner — answering questions, reinforcing concepts, and filling gaps in real time.",
  },
  {
    icon: ShieldCheck,
    color: "bg-purple-100 text-purple-600",
    title: "Trust & Quality",
    desc: "We maintain high standards for course content through peer reviews, ratings, and a creator community that cares about getting things right.",
  },
  {
    icon: Lightning,
    color: "bg-orange-100 text-orange-600",
    title: "Speed to Knowledge",
    desc: "From signing up to watching your first lesson takes less than two minutes. We cut every unnecessary step between curiosity and understanding.",
  },
];

const TEAM = [
  {
    initials: "D",
    name: "Dom",
    role: "Founder & Developer",
    color: "from-blue-500 to-indigo-500",
    bio: "Built PathWise as a Final Year Project to explore what a modern, AI-first LMS could look like for the next generation of learners.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav transparent />

      {/* ── Hero ── */}
      <section className="relative bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-100">Our Story</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Education, Without the
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-indigo-300">
              Price Tag
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            PathWise was built on a simple belief: the quality of your education shouldn't depend on how much you can afford to spend. We're making that real.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Our Mission</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-5 leading-tight">
                Connect learners with the knowledge they need to grow
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                PathWise is an open learning platform where students discover quality courses built by real practitioners. Whether you're picking up a new skill, switching careers, or deepening expertise — there's a path for you here.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                For creators, PathWise eliminates every barrier between knowing something and teaching it. UploadSimple your lessons, publish your course, and watch your knowledge reach students around the world.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Browse Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/teach"
                  className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Start Teaching
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "Free", label: "Always free to learn", icon: Heart, color: "text-rose-500" },
                { value: "AI", label: "Lumi study assistant built in", icon: Sparkle, color: "text-emerald-500" },
                { value: "Open", label: "No paywalls, no gatekeeping", icon: ShieldCheck, color: "text-blue-500" },
                { value: "Fast", label: "Start learning in 2 minutes", icon: Lightning, color: "text-amber-500" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                  <p className="text-2xl font-extrabold text-gray-900 mb-1">{s.value}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">What We Stand For</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Behind PathWise</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-12">
            Who Built This
          </h2>
          {TEAM.map((member) => (
            <div key={member.name} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${member.color} flex items-center justify-center text-white text-3xl font-extrabold mb-5 shadow-lg`}>
                {member.initials}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-4">{member.role}</p>
              <p className="text-gray-500 max-w-md leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lumi callout ── */}
      <section className="py-16 bg-linear-to-br from-emerald-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-5">
            <Sparkle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Meet Lumi — Your AI Study Companion
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-7 max-w-xl mx-auto">
            Every course on PathWise comes with Lumi — an AI assistant that knows your course content and answers questions in real time. No waiting for office hours. No Googling around. Just instant, course-aware help whenever you need it.
          </p>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            See How It Works
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <Users className="w-10 h-10 text-blue-300 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Be part of the PathWise community
          </h2>
          <p className="text-blue-200 mb-8 text-lg max-w-lg mx-auto">
            Whether you're here to learn, to teach, or both — there's a place for you on PathWise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Join for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <Footer2 />
    </div>
  );
}
