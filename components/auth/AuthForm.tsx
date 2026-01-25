"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Video } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const [userType, setUserType] = useState<"student" | "creator">("student");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just redirect based on user type
    // In production, this would handle actual authentication
    if (!isLogin && userType === "creator") {
      router.push("/CreatorDashboard");
    } else {
      // Handle student login/signup
      router.push("/");
    }
  };

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
            {/* User Type Toggle - Only show on signup */}
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
                    <GraduationCap className={`w-8 h-8 mb-2 ${userType === "student" ? "text-blue-600" : "text-gray-400"}`} />
                    <span className="font-semibold text-sm">I'm a Student</span>
                    <span className="text-xs mt-1 text-center">Learn from experts</span>
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
                    <Video className={`w-8 h-8 mb-2 ${userType === "creator" ? "text-blue-600" : "text-gray-400"}`} />
                    <span className="font-semibold text-sm">I'm a Creator</span>
                    <span className="text-xs mt-1 text-center">Teach and inspire</span>
                  </button>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full"
                    />
                  </div>

                  {userType === "creator" && (
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name / Brand Name
                      </label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="e.g., Tech with John"
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full"
                />
              </div>

              {!isLogin && userType === "creator" && (
                <>
                  <div>
                    <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                      Area of Expertise
                    </label>
                    <Input
                      id="expertise"
                      type="text"
                      placeholder="e.g., Web Development, Data Science, Business"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g., 5"
                      className="w-full"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Short Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      placeholder="Tell us about yourself and your teaching experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website / Portfolio (Optional)
                    </label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="w-full"
                    />
                  </div>

                  {userType === "creator" && (
                    <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-lg">
                      <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                      />
                      <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
                        I agree to PathWise's{" "}
                        <Link href="#" className="text-blue-600 hover:text-blue-700">
                          Creator Terms
                        </Link>
                        {" "}and confirm that my content will comply with our{" "}
                        <Link href="#" className="text-blue-600 hover:text-blue-700">
                          Content Policy
                        </Link>
                      </label>
                    </div>
                  )}
                </>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base"
              >
                {isLogin ? "Sign In" : userType === "creator" ? "Create Creator Account" : "Create Account"}
              </Button>
            </form>

            {/* Additional info for creators */}
            {!isLogin && userType === "creator" && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-700">
                  <strong>Note:</strong> Creator accounts undergo a verification process. You'll receive an email within 24-48 hours with next steps to start creating courses.
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
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
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
