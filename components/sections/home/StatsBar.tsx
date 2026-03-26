const stats = [
  { value: "50,000+", label: "Active Learners" },
  { value: "500+", label: "Expert-Led Courses" },
  { value: "4.9★", label: "Average Rating" },
  { value: "120+", label: "World-Class Instructors" },
];

export default function HomeStatsBar() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
