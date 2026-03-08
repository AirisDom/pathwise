"use client";

import { useRef } from "react";
import {
  Award,
  Download,
  GraduationCap,
  X,
} from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  creatorName: string;
  completedDate: string;
  onClose: () => void;
}

export default function CourseCertificate({
  studentName,
  courseName,
  creatorName,
  completedDate,
  onClose,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-3xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificate */}
        <div
          ref={certRef}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Top accent */}
          <div className="h-2 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="p-8 sm:p-12 text-center">
            {/* Logo / Icon */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                PathWise
              </span>
            </div>

            {/* Decorative border */}
            <div className="border-2 border-gray-200 rounded-xl p-6 sm:p-10 relative">
              {/* Corner ornaments */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold mb-2">
                Certificate of Completion
              </p>

              <div className="my-6">
                <Award className="w-14 h-14 text-emerald-500 mx-auto" />
              </div>

              <p className="text-sm text-gray-500 mb-1">
                This is to certify that
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-serif">
                {studentName}
              </h2>

              <p className="text-sm text-gray-500 mb-1">
                has successfully completed the course
              </p>
              <h3 className="text-xl sm:text-2xl font-semibold text-emerald-700 mb-6">
                {courseName}
              </h3>

              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Instructor</p>
                  <p className="font-medium text-gray-700">{creatorName}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="font-medium text-gray-700">{completedDate}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-gray-400 mt-6">
              This certificate verifies that the student completed all course
              lessons on the PathWise platform.
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-2 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
