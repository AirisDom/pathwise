"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold">PathWise</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering learners worldwide with quality education and expert
              instruction.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <span className="text-xl">f</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <span className="text-xl">𝕏</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <span className="text-xl">in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 PathWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
