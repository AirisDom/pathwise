"use client";

import { Users, BookOpen, Star, GraduationCap } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const stats: { value: string; label: string; Icon: Icon }[] = [
  { value: "50,000+", label: "Active Learners", Icon: Users },
  { value: "500+", label: "Expert-Led Courses", Icon: BookOpen },
  { value: "4.9", label: "Average Rating", Icon: Star },
  { value: "120+", label: "World-Class Instructors", Icon: GraduationCap },
];

export default function HomeStatsBar() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <stat.Icon className="w-5 h-5 text-emerald-600" weight="fill" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
