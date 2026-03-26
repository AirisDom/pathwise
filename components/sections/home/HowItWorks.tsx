const steps = [
  {
    number: "01",
    title: "Find your perfect course",
    description:
      "Browse hundreds of courses across tech, business, design, and more. Filter by level, topic, or duration to find exactly what you need.",
    icon: "🔍",
  },
  {
    number: "02",
    title: "Learn with Lumi by your side",
    description:
      "Our AI assistant Lumi builds your personalised path, answers questions instantly, and keeps you on track — every step of the way.",
    icon: "🤖",
  },
  {
    number: "03",
    title: "Earn certificates & level up",
    description:
      "Complete courses to earn verified certificates you can share on LinkedIn and add to your CV. Your next opportunity starts here.",
    icon: "🏆",
  },
];

export default function HomeHowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
            Simple by design
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How PathWise works
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            From first login to career breakthrough — we make the journey clear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-emerald-200 z-0" />

          {steps.map((step) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
              {/* Number badge */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg mb-5">
                {step.icon}
              </div>
              <span className="text-xs font-bold text-emerald-500 tracking-widest uppercase mb-2">
                Step {step.number}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
