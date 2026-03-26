import Link from "next/link";

const categories = [
  {
    label: "Web Development",
    icon: "💻",
    description: "HTML, CSS, React, Node.js & more",
    color: "bg-blue-50 hover:bg-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    label: "Data Science & AI",
    icon: "🤖",
    description: "Python, ML, Deep Learning, LLMs",
    color: "bg-violet-50 hover:bg-violet-100",
    iconBg: "bg-violet-100",
  },
  {
    label: "Business & Finance",
    icon: "📊",
    description: "Investing, accounting, strategy",
    color: "bg-emerald-50 hover:bg-emerald-100",
    iconBg: "bg-emerald-100",
  },
  {
    label: "Design & UX",
    icon: "🎨",
    description: "Figma, UI design, user research",
    color: "bg-pink-50 hover:bg-pink-100",
    iconBg: "bg-pink-100",
  },
  {
    label: "Cybersecurity",
    icon: "🔒",
    description: "Ethical hacking, networks, compliance",
    color: "bg-red-50 hover:bg-red-100",
    iconBg: "bg-red-100",
  },
  {
    label: "Cloud Computing",
    icon: "☁️",
    description: "AWS, Azure, GCP, DevOps",
    color: "bg-sky-50 hover:bg-sky-100",
    iconBg: "bg-sky-100",
  },
  {
    label: "Marketing",
    icon: "📣",
    description: "SEO, social media, growth hacking",
    color: "bg-orange-50 hover:bg-orange-100",
    iconBg: "bg-orange-100",
  },
  {
    label: "Personal Development",
    icon: "🌱",
    description: "Productivity, leadership, communication",
    color: "bg-teal-50 hover:bg-teal-100",
    iconBg: "bg-teal-100",
  },
];

export default function HomeCategoryGrid() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
            What do you want to learn?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Explore by Topic
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            From coding to creativity, we have a course for every goal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href="/StudentBrowse"
              className={`group rounded-2xl p-5 transition-all duration-200 cursor-pointer ${cat.color}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3 ${cat.iconBg}`}
              >
                {cat.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                {cat.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
