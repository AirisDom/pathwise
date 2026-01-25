"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-gray-50 overflow-hidden">
      {/* Animated Background Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Line 1 */}
        <div className="absolute top-20 -left-20 w-96 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-float-slow"></div>
        
        {/* Floating Line 2 */}
        <div className="absolute top-40 right-10 w-80 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40 animate-float-medium"></div>
        
        {/* Floating Line 3 */}
        <div className="absolute top-60 left-1/4 w-72 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-25 animate-float-fast"></div>
        
        {/* Floating Line 4 */}
        <div className="absolute bottom-40 right-1/3 w-64 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-35 animate-float-slow-reverse"></div>
        
        {/* Floating Line 5 */}
        <div className="absolute bottom-20 left-10 w-96 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-float-medium-reverse"></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-blue-300 rounded-full opacity-15 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center py-20">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent leading-tight">
            Learn Without Limits
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Start, switch, or advance your career with thousands of courses,
            Professional Certificates, and degrees from world-class universities
            and companies.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-7 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Join for Free
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-7 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Courses
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">10M+</div>
              <div className="text-gray-600 font-medium">Learners Worldwide</div>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">5,000+</div>
              <div className="text-gray-600 font-medium">Expert-Led Courses</div>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">200+</div>
              <div className="text-gray-600 font-medium">Industry Partners</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
