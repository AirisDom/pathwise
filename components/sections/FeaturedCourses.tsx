"use client";

import { Timeline } from "@/components/ui/timeline";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

const coursesData = [
  {
    title: "Most Popular",
    content: (
      <div>
        <p className="text-gray-800 text-xs md:text-sm font-light mb-8">
          Top-rated courses chosen by millions of learners worldwide
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CourseCard
            title="Google Data Analytics"
            provider="Google"
            type="Professional Certificate"
            rating={4.8}
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Python for Everybody"
            provider="University of Michigan"
            type="Specialization"
            rating={4.8}
            image="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Foundations: Data, Data, Everywhere"
            provider="Google"
            type="Course"
            rating={4.8}
            image="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Machine Learning Specialization"
            provider="DeepLearning.AI"
            type="Specialization"
            rating={4.9}
            image="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&auto=format&fit=crop&q=80"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Weekly Spotlight",
    content: (
      <div>
        <p className="text-gray-800 text-xs md:text-sm font-light mb-8">
          Handpicked courses featuring the latest in technology and business
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CourseCard
            title="Financial Management"
            provider="Duke University"
            type="Specialization"
            rating={4.8}
            image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="ADP Entry-Level Payroll Specialist"
            provider="ADP"
            type="Professional Certificate"
            rating={4.7}
            image="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Financial Analysis"
            provider="University of Illinois"
            type="Specialization"
            rating={4.7}
            image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Investment Management"
            provider="University of Geneva"
            type="Specialization"
            rating={4.6}
            image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&auto=format&fit=crop&q=80"
          />
        </div>
      </div>
    ),
  },
  {
    title: "In-demand AI Skills",
    content: (
      <div>
        <p className="text-gray-800 text-xs md:text-sm font-light mb-4">
          Master the skills that are shaping the future of technology
        </p>
        <div className="mb-8">
          <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
            ✅ Generative AI fundamentals
          </div>
          <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
            ✅ Machine Learning operations
          </div>
          <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
            ✅ Natural Language Processing
          </div>
          <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
            ✅ Computer Vision applications
          </div>
          <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
            ✅ AI Ethics and Responsible AI
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CourseCard
            title="Generative AI for Growth Marketing"
            provider="Multiple Educators"
            type="Specialization"
            rating={4.7}
            image="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Generative AI Software Engineering"
            provider="Vanderbilt University"
            type="Specialization"
            rating={4.8}
            image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="Generative AI Leader"
            provider="Google Cloud"
            type="Professional Certificate"
            rating={4.7}
            image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80"
          />
          <CourseCard
            title="AI Product Management"
            provider="Duke University"
            type="Specialization"
            rating={4.6}
            image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=80"
          />
        </div>
      </div>
    ),
  },
];

function CourseCard({
  title,
  provider,
  type,
  rating,
  image,
}: {
  title: string;
  provider: string;
  type: string;
  rating: number;
  image: string;
}) {
  return (
    <Card className="group overflow-hidden border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="relative h-32 md:h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-600 mb-1 font-light">{provider}</p>
        <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="font-light">{type}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900">{rating}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FeaturedCourses() {
  return (
    <div id="courses" className="w-full">
      <Timeline data={coursesData} />
    </div>
  );
}
