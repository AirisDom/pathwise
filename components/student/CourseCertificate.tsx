"use client";

import { useRef } from "react";
import { X, Download } from "lucide-react";

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

  const handlePrint = () => {
    const printContent = certRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Certificate — ${courseName}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 297mm; height: 210mm; background: white; }
      body { display: flex; align-items: center; justify-content: center; }
      @page { size: A4 landscape; margin: 0; }
    </style>
  </head>
  <body>
    <div style="width:297mm;height:210mm;position:relative;">${printContent.innerHTML}</div>
    <script>window.onload = function(){ window.print(); window.close(); };<\/script>
  </body>
</html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-4xl flex flex-col items-center gap-5">
        {/* ── Certificate ── */}
        <div
          ref={certRef}
          className="w-full bg-white shadow-2xl"
          style={{ aspectRatio: "297/210", maxHeight: "75vh", position: "relative", overflow: "hidden" }}
        >
          {/* Blue side accent */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 10,
            background: "linear-gradient(to bottom, #1d4ed8, #3b82f6, #60a5fa)",
          }} />

          {/* Decorative bg watermark */}
          <svg style={{ position: "absolute", right: -40, bottom: -40, opacity: 0.03, width: 320, height: 320 }} viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="95" stroke="#1d4ed8" strokeWidth="6" />
            <circle cx="100" cy="100" r="75" stroke="#1d4ed8" strokeWidth="4" />
            <circle cx="100" cy="100" r="55" stroke="#1d4ed8" strokeWidth="3" />
            <circle cx="100" cy="100" r="35" stroke="#1d4ed8" strokeWidth="2" />
          </svg>

          {/* Top blue bar */}
          <div style={{
            position: "absolute", top: 0, left: 10, right: 0, height: 5,
            background: "linear-gradient(to right, #1d4ed8, #3b82f6, #818cf8)",
          }} />

          {/* Bottom blue bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 10, right: 0, height: 5,
            background: "linear-gradient(to right, #1d4ed8, #3b82f6, #818cf8)",
          }} />

          {/* Content */}
          <div style={{
            position: "absolute", inset: 0, left: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "32px 56px",
            textAlign: "center",
          }}>
            {/* PathWise wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {/* Book icon inline */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", fontFamily: "Inter, sans-serif" }}>
                PathWise
              </span>
            </div>

            {/* Certificate label */}
            <p style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "#6b7280", fontWeight: 600, marginBottom: 16,
              fontFamily: "Inter, sans-serif",
            }}>
              Certificate of Completion
            </p>

            {/* Divider */}
            <div style={{ width: 60, height: 2, background: "linear-gradient(to right, #1d4ed8, #818cf8)", borderRadius: 2, marginBottom: 20 }} />

            {/* "This is to certify" */}
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
              This is to certify that
            </p>

            {/* Student name */}
            <h2 style={{
              fontSize: 36, fontWeight: 700, color: "#111827", lineHeight: 1.15,
              marginBottom: 16, fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "-0.5px",
            }}>
              {studentName}
            </h2>

            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
              has successfully completed
            </p>

            {/* Course name */}
            <h3 style={{
              fontSize: 18, fontWeight: 600, color: "#1d4ed8", marginBottom: 24,
              maxWidth: 480, lineHeight: 1.3, fontFamily: "Inter, sans-serif",
            }}>
              {courseName}
            </h3>

            {/* Separator dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i === 1 ? "#3b82f6" : "#dbeafe" }} />
              ))}
            </div>

            {/* Instructor + Date */}
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>Instructor</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: "Inter, sans-serif" }}>{creatorName}</p>
                <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />
              </div>
              <div style={{ width: 1, height: 32, background: "#e5e7eb" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>Completed</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: "Inter, sans-serif" }}>{completedDate}</p>
                <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />
              </div>
            </div>

            {/* Fine print */}
            <p style={{ fontSize: 9, color: "#d1d5db", marginTop: 20, fontFamily: "Inter, sans-serif" }}>
              Issued by PathWise · This certificate verifies completion of all course lessons.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-900/30"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
