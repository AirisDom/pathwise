"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { name: "How It Works", href: "/how-it-works" },
  { name: "Teach on PathWise", href: "/teach" },
];

export default function PublicNav({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => pathname === href;

  const bgClass = transparent
    ? scrolled
      ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
      : "bg-transparent border-b border-transparent"
    : scrolled
    ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
    : "bg-white border-b border-gray-100";

  return (
    <header className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Desktop nav (left group) */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/images/logo.png"
                alt="PathWise"
                className={`h-9 w-auto transition-all ${
                  transparent && !scrolled ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive(l.href)
                      ? "text-blue-600 bg-blue-50"
                      : transparent && !scrolled
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {l.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                transparent && !scrolled
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              transparent && !scrolled ? "text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" weight="regular" /> : <List className="w-5 h-5" weight="regular" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 space-y-1 rounded-b-2xl shadow-lg">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block text-sm font-medium px-4 py-2.5 rounded-lg mx-2 transition-colors ${
                  isActive(l.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {l.name}
              </Link>
            ))}
            <div className="flex gap-2 px-2 pt-3 border-t border-gray-100 mt-3">
              <Link
                href="/login"
                className="flex-1 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg py-2.5 hover:bg-blue-700"
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
