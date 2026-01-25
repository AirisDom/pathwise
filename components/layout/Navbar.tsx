"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-12 w-auto transition-all duration-300 group-hover:scale-105">
              <img
                src="/images/logo.png"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Courses
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              For Business
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
