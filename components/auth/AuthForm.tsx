"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  GraduationCap,
  Video,
  CircleNotch,
  CheckCircle,
  Warning,
  ArrowLeft,
  Envelope,
  Briefcase,
  ArrowRight,
  Check,
  BookOpen,
  Users,
  Sparkle,
} from "@phosphor-icons/react";

interface AuthFormProps {
  mode: "login" | "signup";
}

type Step = "form" | "verify";

// ═══════════════════════════════════════
// Left Panel — decorative branding side
// ═══════════════════════════════════════

function LeftPanel({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 text-white p-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl" />

      {/* Logo */}
      <div className="relative">
        <Link href="/" className="inline-block">
          <img src="/images/logo.png" alt="PathWise" className="h-10 w-auto brightness-0 invert" />
        </Link>
      </div>

      {/* Middle content */}
      <div className="relative space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight mb-3">
            {isLogin
              ? "Welcome back.\nLet's keep learning."
              : "Your learning journey\nstarts here."}
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            {isLogin
              ? "Jump back into your courses, track your progress, and keep building your skills."
              : "Join PathWise and access hundreds of courses taught by experts — completely free."}
          </p>
        </div>

        <ul className="space-y-4">
          {(isLogin
            ? [
                { icon: BookOpen, text: "Resume where you left off" },
                { icon: Users, text: "Connect with your instructors" },
                { icon: Sparkle, text: "Chat with Lumi, your AI study buddy" },
              ]
            : [
                { icon: BookOpen, text: "Hundreds of free courses" },
                { icon: GraduationCap, text: "Learn at your own pace" },
                { icon: Sparkle, text: "AI-powered study assistant included" },
              ]
          ).map((item) => (
            <li key={item.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-blue-300" />
              </div>
              <span className="text-sm text-blue-100">{item.text}</span>
            </li>
          ))}
        </ul>

        {/* Platform highlights card */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm space-y-3">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide">What you get with PathWise</p>
          {[
            { emoji: "🎓", text: "Enroll in any course for free — forever" },
            { emoji: "🤖", text: "Lumi AI study assistant on every course" },
            { emoji: "📈", text: "Track your progress lesson by lesson" },
            { emoji: "🌍", text: "Learn from creators around the world" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2.5">
              <span className="text-sm mt-0.5">{item.emoji}</span>
              <span className="text-xs text-blue-100 leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <p className="relative text-xs text-blue-400">
        © {new Date().getFullYear()} PathWise. Free to learn. Free to teach.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════
// Main AuthForm Component
// ═══════════════════════════════════════

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [step, setStep] = useState<Step>("form");
  const [userType, setUserType] = useState<"student" | "creator">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [headline, setHeadline] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: userType === "creator" ? "CREATOR" : "STUDENT",
          ...(userType === "creator" && {
            headline: headline || undefined,
            expertise: expertise || undefined,
            experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
            bio: bio || undefined,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong");
        return;
      }

      setStep("verify");
      setResendCooldown(60);
      setSuccess(data.message || "Check your email for a verification code!");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "student" | "creator") => {
    setError("");
    setLoading(true);
    const demoEmail = role === "student" ? "student@demo.com" : "creator@demo.com";
    try {
      const result = await signIn("credentials", {
        email: demoEmail,
        password: "Demo1234!",
        redirect: false,
      });
      if (result?.error) {
        setError("Demo account not ready. Please run: npm run seed");
        return;
      }
      router.push(role === "creator" ? "/CreatorDashboard" : "/StudentDashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setError("Please verify your email before signing in.");
          setStep("verify");
          setResendCooldown(0);
        } else {
          setError("Invalid email or password");
        }
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "CREATOR" || session?.user?.role === "ADMIN") {
        router.push("/CreatorDashboard");
      } else {
        router.push(callbackUrl || "/StudentDashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newValues = [...otpValues];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otpValues.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Invalid code");
        setOtpValues(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        return;
      }

      setSuccess("Email verified! Signing you in...");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setSuccess("Email verified! Please sign in.");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "CREATOR" || session?.user?.role === "ADMIN") {
        router.push("/CreatorDashboard");
      } else {
        router.push(callbackUrl || "/StudentDashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to resend code");
        return;
      }

      setSuccess("A new code has been sent to your email!");
      setResendCooldown(60);
      setOtpValues(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared alert component ──
  const Alert = ({ type, msg }: { type: "error" | "success"; msg: string }) => (
    <div
      className={`flex items-start gap-3 rounded-xl p-3.5 text-sm mb-5 border-l-4 ${
        type === "error"
          ? "bg-red-50 border-red-500 text-red-700"
          : "bg-emerald-50 border-emerald-500 text-emerald-700"
      }`}
    >
      {type === "error" ? (
        <Warning className="w-4 h-4 shrink-0 mt-0.5" weight="fill" />
      ) : (
        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" weight="fill" />
      )}
      <span>{msg}</span>
    </div>
  );

  // ── Shared input style ──
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

  // ═══════════════════════════════════════
  // OTP STEP
  // ═══════════════════════════════════════

  if (step === "verify") {
    return (
      <div className="min-h-screen lg:grid lg:grid-cols-[45%_55%]">
        <LeftPanel mode={mode} />

        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <Link href="/" className="flex justify-center mb-8 lg:hidden">
              <img src="/images/logo.png" alt="PathWise" className="h-10 w-auto" />
            </Link>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6">
              <Envelope className="w-7 h-7 text-blue-600" weight="regular" />
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
              Check your email
            </h1>
            <p className="text-sm text-gray-500 text-center mb-7">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-800">{email}</span>
            </p>

            {error && <Alert type="error" msg={error} />}
            {success && <Alert type="success" msg={success} />}

            {/* Progress steps */}
            <div className="flex items-center justify-center gap-2 mb-7">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" weight="bold" />
                </div>
                <span className="text-xs text-gray-400">Info</span>
              </div>
              <div className="w-8 h-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" weight="bold" />
                </div>
                <span className="text-xs text-gray-400">Account</span>
              </div>
              <div className="w-8 h-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600">Verify</span>
              </div>
            </div>

            {/* OTP inputs */}
            <div className="flex justify-center gap-2.5 mb-7" onPaste={handleOtpPaste}>
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-2xl font-bold text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otpValues.join("").length !== 6}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <CircleNotch className="w-5 h-5 animate-spin" weight="regular" />
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" weight="bold" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-5">
              Didn&apos;t receive the code?{" "}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Resend code
                </button>
              )}
            </p>

            <button
              onClick={() => {
                setStep("form");
                setError("");
                setSuccess("");
                setOtpValues(["", "", "", "", "", ""]);
              }}
              className="mt-4 flex items-center justify-center gap-1 w-full text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" weight="regular" />
              Back to {isLogin ? "sign in" : "sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // MAIN FORM
  // ═══════════════════════════════════════

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[45%_55%]">
      <LeftPanel mode={mode} />

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex justify-center mb-8 lg:hidden">
            <img src="/images/logo.png" alt="PathWise" className="h-10 w-auto" />
          </Link>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 mb-7">
            {isLogin
              ? "Enter your credentials to access your account"
              : userType === "student"
              ? "Start your learning journey today"
              : "Share your knowledge and inspire learners"}
          </p>

          {error && <Alert type="error" msg={error} />}
          {success && <Alert type="success" msg={success} />}

          {/* User type toggle — signup only */}
          {!isLogin && (
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {(["student", "creator"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                      userType === type
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {type === "student" ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    {type === "student" ? "Student" : "Creator"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={isLogin ? handleLogin : handleSignup}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                {isLogin && (
                  <Link href="#" className="text-xs text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={inputCls}
              />
              {!isLogin && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className={inputCls}
                />
              </div>
            )}

            {/* Remember me — login only */}
            {isLogin && (
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
            )}

            {/* Creator-specific fields */}
            {!isLogin && userType === "creator" && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-xl px-3 py-2.5">
                  <Briefcase className="h-4 w-4" weight="regular" />
                  Creator Profile Details
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Web Developer & Educator"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={120}
                    className={inputCls}
                  />
                  <p className="mt-1 text-xs text-gray-400">A short title that describes your expertise</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Area of Expertise
                  </label>
                  <select
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select your primary area</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science &amp; ML</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Game Development">Game Development</option>
                    <option value="Business & Marketing">Business &amp; Marketing</option>
                    <option value="Photography & Video">Photography &amp; Video</option>
                    <option value="Music & Audio">Music &amp; Audio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min={0}
                    max={50}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Short Bio
                  </label>
                  <textarea
                    placeholder="Tell future students about yourself and what you'll teach..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-400 text-right">{bio.length}/500</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <CircleNotch className="w-5 h-5 animate-spin" weight="regular" />
              ) : (
                <>
                  {isLogin
                    ? "Sign In"
                    : userType === "creator"
                    ? "Create Creator Account"
                    : "Create Account"}
                  <ArrowRight className="w-4 h-4" weight="bold" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts — login only */}
          {isLogin && (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
                Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("student")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <GraduationCap className="w-4 h-4" weight="fill" />
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("creator")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  <Video className="w-4 h-4" weight="fill" />
                  Creator Demo
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </Link>
          </p>

          <p className="text-center mt-4">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
