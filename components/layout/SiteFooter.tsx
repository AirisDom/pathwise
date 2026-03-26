import Link from "next/link";

const links = {
  Learn: [
    { label: "Browse Courses", href: "/StudentBrowse" },
    { label: "Specialisations", href: "#" },
    { label: "Free Courses", href: "#" },
    { label: "Certificates", href: "#" },
  ],
  Teach: [
    { label: "Become an Instructor", href: "/teach" },
    { label: "Creator Dashboard", href: "/CreatorDashboard" },
    { label: "Teaching Resources", href: "#" },
    { label: "Instructor Support", href: "#" },
  ],
  Company: [
    { label: "About PathWise", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
  Support: [
    { label: "Help Centre", href: "#" },
    { label: "Community", href: "#" },
    { label: "Student Support", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

const socials = [
  { label: "Twitter / X", href: "#", icon: "𝕏" },
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "Instagram", href: "#", icon: "◎" },
];

export default function HomeFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 pb-12 border-b border-gray-800">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="text-white font-bold text-lg">PathWise</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Learn without limits. PathWise brings together world-class
              courses, expert instructors, and Lumi — your personal AI guide —
              to help you reach your goals.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-emerald-600 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-emerald-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 PathWise. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
