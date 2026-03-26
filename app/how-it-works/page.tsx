"use client";
import Link from "next/link";
import PublicNav from "@/components/layout/PublicNav";
import SiteFooter from "@/components/layout/SiteFooter";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Lightbulb,
  ChatCircle,
  Play,
  MagnifyingGlass,
  Sparkle,
  Star,
  TrendUp,
  UploadSimple,
  UserPlus,
  Video,
} from "@phosphor-icons/react";


export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav transparent />

      {/* ── Hero ── */}
      <section className="relative bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5">
            How PathWise Works
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-xl mx-auto">
            From sign-up to your first completed lesson — here's exactly how the PathWise learning experience works for students and creators.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <a href="#students" className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">
              For Students
            </a>
            <a href="#creators" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors text-sm">
              For Creators
            </a>
          </div>
        </div>
      </section>

      {/* ── For Students ── */}
      <section id="students" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              For Students
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Your Learning Journey
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Getting started takes less than two minutes. Here's the full picture.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                icon: UserPlus,
                color: "bg-blue-600",
                iconBg: "bg-blue-100 text-blue-600",
                title: "Create a free account",
                desc: "Sign up with your email in seconds. No credit card, no subscription. We'll send a quick verification code to make sure it's you.",
                detail: "Choose your role — Student or Creator — and you're in.",
              },
              {
                step: "02",
                icon: MagnifyingGlass,
                color: "bg-indigo-600",
                iconBg: "bg-indigo-100 text-indigo-600",
                title: "Discover courses that match your goals",
                desc: "Browse hundreds of courses across web development, data science, design, business, music, and more. Faders by level, category, or rating.",
                detail: "Every course shows you exactly what you'll learn, how many lessons it has, who teaches it, and what other students think.",
              },
              {
                step: "03",
                icon: Play,
                color: "bg-emerald-600",
                iconBg: "bg-emerald-100 text-emerald-600",
                title: "Enroll and start learning instantly",
                desc: "Click 'Enroll Free' and you're in the course immediately. No waiting, no approval — just hit play on the first lesson.",
                detail: "Your progress is saved automatically so you can pick up exactly where you left off on any device.",
              },
              {
                step: "04",
                icon: Sparkle,
                color: "bg-purple-600",
                iconBg: "bg-purple-100 text-purple-600",
                title: "Ask Lumi anything, any time",
                desc: "Every course includes Lumi — our AI study assistant. Stuck on a concept? Not sure what a term means? Lumi knows the course content and answers instantly.",
                detail: "Lumi is always in the bottom-right corner of the learn page. Open it, type your question, and get a streaming, markdown-formatted answer in seconds.",
              },
              {
                step: "05",
                icon: TrendUp,
                color: "bg-amber-600",
                iconBg: "bg-amber-100 text-amber-600",
                title: "Track progress and complete your course",
                desc: "Your student dashboard shows all enrolled courses, lesson-by-lesson progress, and how much of each course you've completed.",
                detail: "Finish every lesson and section to complete your course and deepen your understanding.",
              },
            ].map((item, idx) => (
              <div key={item.step} className="flex gap-5 sm:gap-8 items-start">
                {/* Step indicator + line */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white text-sm font-extrabold shadow-sm`}>
                    {item.step}
                  </div>
                  {idx < 4 && <div className="w-0.5 h-full bg-gray-100 mt-2 min-h-[3rem]" />}
                </div>
                {/* Content */}
                <div className="pb-8 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-2">{item.desc}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lumi Deep Dive ── */}
      <section className="py-16 bg-linear-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Sparkle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Lumi, Your AI Tutor</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-5">
                Lumi is a course-aware AI assistant powered by Claude. Unlike generic chatbots, Lumi is injected with context about your current course and lesson — so when you ask "can you explain this concept again?", Lumi actually knows what you're working on.
              </p>
              <ul className="space-y-3">
                {[
                  "Answers course-specific questions instantly",
                  "Explains concepts in simpler language",
                  "Gives real-world examples and analogies",
                  "Available 24/7 — no waiting for instructor replies",
                  "Streaming responses rendered in rich markdown",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock chat UI */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-700 bg-gray-800">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">L</div>
                <div>
                  <p className="text-xs font-semibold text-white">Lumi</p>
                  <p className="text-[10px] text-emerald-400">AI Study Assistant</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-end">
                  <div className="bg-emerald-600 text-white text-sm px-3 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                    I don't understand closures in JavaScript. Can you explain?
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1">L</div>
                  <div className="bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                    <p className="mb-1.5">Great question! A <span className="text-emerald-300 font-mono text-xs bg-gray-950 px-1 rounded">closure</span> is a function that <strong>"remembers"</strong> its outer variables even after the outer function has finished running.</p>
                    <p className="text-gray-400 text-xs">Think of it like a backpack — the inner function carries its outer scope with it wherever it goes. 🎒</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">L</div>
                  <div className="bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                    Would you like a quick code example?
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <div className="bg-gray-700 rounded-xl px-3 py-2 text-gray-400 text-sm flex items-center gap-2">
                  <ChatCircle className="w-3.5 h-3.5" />
                  Ask Lumi anything…
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Creators ── */}
      <section id="creators" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 text-sm text-purple-700 font-medium mb-4">
              <Video className="w-4 h-4" />
              For Creators
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Build and Publish Your Course
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Everything you need to turn your expertise into a structured, discoverable course.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                color: "bg-amber-100 text-amber-600",
                num: "01",
                title: "Sign up as a Creator",
                desc: "Select 'Creator' when you sign up. Add a headline, your area of expertise, years of experience, and a short bio. This becomes your public profile.",
              },
              {
                icon: BookOpen,
                color: "bg-blue-100 text-blue-600",
                num: "02",
                title: "Create and structure your course",
                desc: "Use our course builder to define your title, description, learning outcomes, requirements, and target audience. Organise content into sections and lessons.",
              },
              {
                icon: UploadSimple,
                color: "bg-indigo-100 text-indigo-600",
                num: "03",
                title: "UploadSimple lessons with drag & drop",
                desc: "UploadSimple video lessons with our built-in drag-and-drop uploader. Duration is detected automatically. Add titles and order lessons within each section.",
              },
              {
                icon: Star,
                color: "bg-amber-100 text-amber-600",
                num: "04",
                title: "Add a thumbnail and details",
                desc: "UploadSimple a course thumbnail (16:9 recommended), set the difficulty level, category, and language. Polish the settings using the Gear panel in the editor.",
              },
              {
                icon: Play,
                color: "bg-emerald-100 text-emerald-600",
                num: "05",
                title: "Publish with one click",
                desc: "When you're ready, hit the Publish button in the course editor. Your course goes live immediately and becomes discoverable on the courses browse page.",
              },
              {
                icon: TrendUp,
                color: "bg-rose-100 text-rose-600",
                num: "06",
                title: "Track performance in analytics",
                desc: "Your creator dashboard shows enrollments, ratings, reviews, and lesson completion data. See which lessons students engage with most.",
              },
            ].map((item) => (
              <div key={item.num} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">Step {item.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/teach"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              Start Teaching on PathWise
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is PathWise really free?",
                a: "Yes, completely. There are no paid tiers, no course purchase fees, and no hidden costs. Both learning and teaching are free on PathWise.",
              },
              {
                q: "Do I need to verify my email?",
                a: "Yes — we send a 6-digit verification code when you sign up. This helps us keep spam accounts out and protect the community.",
              },
              {
                q: "Can I be both a student and a creator?",
                a: "Currently accounts are either Student or Creator. You can sign up for a second account to experience both roles.",
              },
              {
                q: "How does Lumi know about my course?",
                a: "When you open Lumi on the learn page, it receives context about the course title, current lesson title, and lesson type. This lets it give relevant, focused answers rather than generic responses.",
              },
              {
                q: "Can I edit my course after publishing?",
                a: "Yes. You can add sections, add or edit lessons, update course settings, and upload new video content at any time. Changes take effect immediately.",
              },
              {
                q: "What video formats are supported?",
                a: "PathWise accepts standard video formats (MP4, WebM, MOV, etc.) through the drag-and-drop uploader. Videos are stored and served directly — no re-encoding required.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-gray-900 text-sm select-none list-none">
                  {faq.q}
                  <span className="w-5 h-5 rounded-full bg-gray-100 group-open:bg-blue-100 flex items-center justify-center shrink-0 transition-colors text-gray-500 group-open:text-blue-600 text-xs font-bold">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6">
          <GraduationCap className="w-12 h-12 text-blue-300 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to get started?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Create your account in seconds and start learning — or start teaching — today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
