"use client";

import Link from "next/link";
import { ArrowLeft, DollarSign, TrendingUp, Info } from "lucide-react";

export default function CreatorRevenuePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/CreatorDashboard"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Revenue</h1>
              <p className="text-xs text-gray-500">Earnings &amp; payouts</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Free Platform
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            PathWise is a free educational platform — all courses are available at
            no cost to students. As a university project, there are no payment
            transactions to display.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            <Info className="w-4 h-4" />
            Focus on growing your student base and improving course ratings!
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm mx-auto">
            <Link
              href="/creator/analytics"
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors text-center"
            >
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">View Analytics</p>
            </Link>
            <Link
              href="/creator/students"
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors text-center"
            >
              <DollarSign className="w-5 h-5 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">View Students</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
