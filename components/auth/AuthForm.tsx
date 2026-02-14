"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Briefcase,
} from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

type Step = "form" | "verify";

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();

  // ── State ──
  const [step, setStep] = useState<Step>("form");
  const [userType, setUserType] = useState<"student" | "creator">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Creator-specific fields
  const [headline, setHeadline] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");

  // OTP
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Signup Handler ──
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

      // Move to OTP verification step
      setStep("verify");
      setResendCooldown(60);
      setSuccess(data.message || "Check your email for a verification code!");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Login Handler ──
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
        // NextAuth wraps the error message
        if (result.error.includes("verify your email")) {
          setError("Please verify your email before signing in.");
          // Offer to resend code
          setStep("verify");
          setResendCooldown(0);
        } else {
          setError("Invalid email or password");
        }
        return;
      }

      // Success — redirect based on role
      // Fetch session to get role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "CREATOR" || session?.user?.role === "ADMIN") {
        router.push("/CreatorDashboard");
      } else {
        router.push("/StudentDashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handlers ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newValues = [...otpValues];
    newValues[index] = value.slice(-1); // single digit
    setOtpValues(newValues);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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
    // Focus last filled or the next empty
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  // ── Verify OTP Handler ──
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

      // Auto sign in after verification
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Verification worked but auto-login failed, send to login page
        setSuccess("Email verified! Please sign in.");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      // Fetch session for role-based redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "CREATOR" || session?.user?.role === "ADMIN") {
        router.push("/CreatorDashboard");
      } else {
        router.push("/StudentDashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Code Handler ──
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

  // ═══════════════════════════════════════
  // OTP VERIFICATION STEP
  // ═══════════════════════════════════════
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center mb-8">
            <div className="relative h-12 w-auto transition-all duration-300 hover:scale-105">
              <img
                src="/images/logo.png"
                alt="PathWise"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          <Card className="border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check your email
              </CardTitle>
              <CardDescription className="text-gray-600">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-gray-800">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error / Success Messages */}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
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
                    className="h-14 w-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-2xl font-bold text-gray-900 transition-all
                      focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otpValues.join("").length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Verify Email"
                )}
              </Button>

              {/* Resend */}
              <div className="mt-5 text-center text-sm text-gray-600">
                Didn't receive the code?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-gray-400">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Resend code
                  </button>
                )}
              </div>

              {/* Back */}
              <button
                onClick={() => {
                  setStep("form");
                  setError("");
                  setSuccess("");
                  setOtpValues(["", "", "", "", "", ""]);
                }}
                className="mt-4 flex items-center justify-center gap-1 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to {isLogin ? "sign in" : "sign up"}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // MAIN FORM (LOGIN / SIGNUP)
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <div className="relative h-12 w-auto transition-all duration-300 hover:scale-105">
            <img
              src="/images/logo.png"
              alt="PathWise"
              className="h-full w-auto object-contain"
            />
          </div>
        </Link>

        {/* Auth Card */}
        <Card className="border-gray-200 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin
                ? "Enter your credentials to access your account"
                : userType === "student"
                ? "Start your learning journey today"
                : "Share your knowledge and inspire learners worldwide"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error / Success Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}

            {/* User Type Toggle — only on signup */}
            {!isLogin && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("student")}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      userType === "student"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <GraduationCap
                      className={`w-8 h-8 mb-2 ${
                        userType === "student"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-semibold text-sm">I&apos;m a Student</span>
                    <span className="text-xs mt-1 text-center">
                      Learn from experts
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("creator")}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      userType === "creator"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Video
                      className={`w-8 h-8 mb-2 ${
                        userType === "creator"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-semibold text-sm">I&apos;m a Creator</span>
                    <span className="text-xs mt-1 text-center">
                      Teach and inspire
                    </span>
                  </button>
                </div>
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={isLogin ? handleLogin : handleSignup}
            >
              {/* Name — signup only */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full"
                />
                {!isLogin && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                  </p>
                )}
              </div>

              {/* Confirm Password — signup only */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full"
                  />
                </div>
              )}

              {/* Creator-specific fields — signup as creator only */}
              {!isLogin && userType === "creator" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                    <Briefcase className="h-4 w-4" />
                    Creator Profile Details
                  </div>

                  {/* Headline */}
                  <div>
                    <label
                      htmlFor="headline"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Professional Headline
                    </label>
                    <Input
                      id="headline"
                      type="text"
                      placeholder="e.g. Senior Web Developer & Educator"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      maxLength={120}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      A short title that describes your expertise
                    </p>
                  </div>

                  {/* Expertise Area */}
                  <div>
                    <label
                      htmlFor="expertise"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Area of Expertise
                    </label>
                    <select
                      id="expertise"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

                  {/* Years of Experience */}
                  <div>
                    <label
                      htmlFor="experienceYears"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Years of Experience
                    </label>
                    <Input
                      id="experienceYears"
                      type="number"
                      placeholder="e.g. 5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      min={0}
                      max={50}
                      className="w-full"
                    />
                  </div>

                  {/* Short Bio */}
                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Short Bio
                    </label>
                    <textarea
                      id="bio"
                      placeholder="Tell future students about yourself and what you'll teach..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">
                      {bio.length}/500
                    </p>
                  </div>
                </div>
              )}

              {/* Remember + Forgot — login only */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLogin ? (
                  "Sign In"
                ) : userType === "creator" ? (
                  "Create Creator Account"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full border-gray-300">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full border-gray-300">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
