"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Video, FileText } from "lucide-react";

interface FileUploadProps {
  /** "image" or "video" */
  type: "image" | "video";
  /** Current value (URL) */
  value: string;
  /** Called when upload completes with the URL */
  onChange: (url: string) => void;
  /** Label shown above the dropzone */
  label?: string;
  /** Additional class names for wrapper */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUpload({
  type,
  value,
  onChange,
  label,
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = type === "image"
    ? "image/jpeg,image/jpg,image/png,image/webp,image/gif"
    : "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";

  const maxSize = type === "image" ? 10 : 500; // MB
  const maxSizeBytes = maxSize * 1024 * 1024;

  const uploadFile = useCallback(async (file: File) => {
    // Validate on client side too
    if (file.size > maxSizeBytes) {
      setError(`File too large. Max ${maxSize}MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError("");
    setFileName(file.name);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      // Use XMLHttpRequest for progress tracking
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.success && json.data?.url) {
                resolve(json.data.url);
              } else {
                reject(new Error(json.error?.message || "Upload failed"));
              }
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.error?.message || `Upload failed (${xhr.status})`));
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setStatus("success");
      setProgress(100);
      onChange(url);

      // Reset status after a moment
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }, [type, maxSize, maxSizeBytes, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, [disabled, uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  }, [uploadFile]);

  const handleRemove = useCallback(() => {
    onChange("");
    setStatus("idle");
    setProgress(0);
    setFileName("");
    setError("");
  }, [onChange]);

  const Icon = type === "image" ? ImageIcon : Video;

  // If there's a value (already uploaded), show the preview
  if (value) {
    return (
      <div className={`${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        )}
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {type === "image" ? (
            <div className="relative aspect-video">
              <img
                src={value}
                alt="Uploaded thumbnail"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="relative aspect-video bg-gray-900 rounded-xl">
              <video
                src={value}
                className="w-full h-full object-contain rounded-xl"
                controls
                preload="metadata"
              />
            </div>
          )}

          {/* Remove button */}
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* File name tag */}
          {fileName && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full z-10">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="truncate max-w-50">{fileName}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 ease-in-out
          ${type === "image" ? "py-8 px-6" : "py-10 px-6"}
          ${disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
            : dragActive
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : status === "error"
                ? "border-red-300 bg-red-50 hover:border-red-400"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {status === "uploading" ? (
          /* Uploading state */
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Uploading…</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-50">{fileName}</p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
        ) : status === "success" ? (
          /* Success state (brief) */
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">Uploaded successfully!</p>
          </div>
        ) : (
          /* Default / Error state */
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              status === "error" ? "bg-red-100" : "bg-gray-100"
            }`}>
              {status === "error" ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Icon className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {status === "error" ? "Upload failed" : (
                  <>
                    <span className="text-blue-600">Click to upload</span>
                    {" "}or drag and drop
                  </>
                )}
              </p>
              {status === "error" ? (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {type === "image"
                    ? "JPEG, PNG, WebP or GIF — Max 10MB"
                    : "MP4, WebM, MOV, AVI or MKV — Max 500MB"
                  }
                </p>
              )}
            </div>

            {status === "error" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus("idle");
                  setError("");
                }}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
