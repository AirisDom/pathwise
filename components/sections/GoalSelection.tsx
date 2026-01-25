"use client";

import { Card } from "@/components/ui/card";
import { Rocket, RefreshCw, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";

const goals = [
  {
    id: 1,
    icon: Rocket,
    label: "Start my career",
    color: "bg-blue-600",
  },
  {
    id: 2,
    icon: RefreshCw,
    label: "Change my career",
    color: "bg-blue-600",
  },
  {
    id: 3,
    icon: TrendingUp,
    label: "Grow in my current role",
    color: "bg-blue-600",
  },
  {
    id: 4,
    icon: Lightbulb,
    label: "Explore topics outside of work",
    color: "bg-blue-600",
  },
];

export default function GoalSelection() {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4">
          {/* Title */}
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
            What brings you to PathWise today?
          </h2>

          {/* Goal Options - All in one line */}
          <div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-3">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.id;
              
              return (
                <Card
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`
                    group cursor-pointer border-2 transition-all duration-300
                    hover:shadow-lg hover:scale-105 hover:border-blue-500
                    ${isSelected 
                      ? 'border-blue-600 shadow-md scale-105' 
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 px-4 lg:px-5 py-3">
                    {/* Icon */}
                    <div className={`
                      ${goal.color} p-2 rounded-lg
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    
                    {/* Label */}
                    <span className={`
                      text-sm font-medium transition-colors duration-300 whitespace-nowrap
                      ${isSelected 
                        ? 'text-blue-600' 
                        : 'text-gray-900 group-hover:text-blue-600'
                      }
                    `}>
                      {goal.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
