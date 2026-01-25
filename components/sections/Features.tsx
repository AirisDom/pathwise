"use client";

const features = [
  {
    id: 1,
    icon: "🎓",
    title: "Learn From Experts",
    description: "Access courses from world-class universities and industry leaders",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Flexible Learning",
    description: "Study at your own pace with lifetime access to course materials",
  },
  {
    id: 3,
    icon: "📜",
    title: "Earn Certificates",
    description: "Get recognized credentials to advance your career",
  },
  {
    id: 4,
    icon: "🤝",
    title: "Join Community",
    description: "Connect with millions of learners worldwide",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Why Choose PathWise?
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to achieve your learning goals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 hover:border-blue-300 transform hover:-translate-y-2"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
