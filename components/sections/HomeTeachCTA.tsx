import Link from "next/link";

export default function HomeTeachCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-16 sm:px-16 sm:py-20">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center lg:text-left">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                Become a Creator
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Share your expertise.{" "}
                <span className="text-emerald-400">Build an income.</span>
              </h2>
              <p className="mt-4 text-gray-400 text-lg leading-relaxed">
                Join 120+ instructors already earning on PathWise. Upload your
                first course in minutes — our tools handle the rest, so you can
                focus on teaching.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Keep up to 90% of
                  your course revenue
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Access real-time
                  student analytics
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Reach a global
                  community of learners
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Link
                href="/teach"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
              >
                Start teaching today
                <span>→</span>
              </Link>
              <Link
                href="/teach"
                className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
