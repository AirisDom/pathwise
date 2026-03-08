"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, PaperPlaneRight, ArrowCounterClockwise } from "@phosphor-icons/react";

// ═══════════════════════════════════════
// Lumi Owl Icon
// ═══════════════════════════════════════

function LumiIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "sm" ? 12 : size === "lg" ? 22 : 16;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Face */}
      <circle cx="16" cy="13" r="10" fill="white" opacity="0.95" />
      {/* Glasses bridge */}
      <line x1="13.5" y1="12.5" x2="18.5" y2="12.5" stroke="white" strokeWidth="1.2" opacity="0.8" />
      {/* Left lens */}
      <rect x="7" y="10" width="6" height="5" rx="2" stroke="white" strokeWidth="1.3" fill="none" opacity="0.9" />
      {/* Right lens */}
      <rect x="19" y="10" width="6" height="5" rx="2" stroke="white" strokeWidth="1.3" fill="none" opacity="0.9" />
      {/* Eyes through lenses */}
      <circle cx="10" cy="12.5" r="1.2" fill="white" opacity="0.95" />
      <circle cx="22" cy="12.5" r="1.2" fill="white" opacity="0.95" />
      {/* Smile */}
      <path d="M13 17 Q16 19.5 19 17" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Book at bottom */}
      <rect x="9" y="22" width="14" height="8" rx="1.5" fill="white" opacity="0.85" />
      <line x1="16" y1="22" x2="16" y2="30" stroke="#059669" strokeWidth="1.2" opacity="0.6" />
      <line x1="11" y1="25" x2="15" y2="25" stroke="#059669" strokeWidth="0.9" opacity="0.5" />
      <line x1="11" y1="27" x2="15" y2="27" stroke="#059669" strokeWidth="0.9" opacity="0.5" />
      <line x1="17" y1="25" x2="21" y2="25" stroke="#059669" strokeWidth="0.9" opacity="0.5" />
      <line x1="17" y1="27" x2="21" y2="27" stroke="#059669" strokeWidth="0.9" opacity="0.5" />
    </svg>
  );
}

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LumiChatProps {
  courseTitle: string;
  lessonTitle: string | null;
  lessonType: string | null;
}

// ═══════════════════════════════════════
// Simple markdown renderer
// ═══════════════════════════════════════

function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, "").replace(/```$/, "");
      return `<pre class="bg-gray-950 text-emerald-300 text-xs p-2 rounded-lg my-1 overflow-x-auto whitespace-pre-wrap">${escapeHtml(code.trim())}</pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-950 text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Bullet points
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, "<br/>");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function LumiChat({ courseTitle, lessonTitle, lessonType }: LumiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build welcome message
  const welcomeMessage = useCallback((): Message => ({
    role: "assistant",
    content: `Hi! I'm **Lumi**, your AI study assistant for **${courseTitle}**. ${lessonTitle ? `I can see you're on "${lessonTitle}" — ` : ""}Ask me anything about the course content, and I'll do my best to help you learn! 🎓`,
  }), [courseTitle, lessonTitle]);

  // Reset messages when lesson changes
  useEffect(() => {
    setMessages([welcomeMessage()]);
  }, [lessonTitle, welcomeMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Add empty assistant placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          courseContext: {
            courseTitle,
            lessonTitle,
            lessonType,
          },
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Failed to connect to Lumi" }));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Sorry, I ran into an issue: ${err.error || "Please try again."}`,
          };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
          }
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please check your connection and try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, courseTitle, lessonTitle, lessonType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([welcomeMessage()]);
    setInput("");
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-900/40 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open Lumi AI Study Assistant"
      >
        <LumiIcon size="md" />
        <span className="text-sm font-semibold">Lumi</span>
        {isOpen && <X className="w-3.5 h-3.5 opacity-70" weight="regular" />}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-50 flex flex-col bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: "min(380px, calc(100vw - 3rem))",
            height: "min(560px, calc(100vh - 8rem))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm">
                <LumiIcon size="md" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Lumi</p>
                <p className="text-[10px] text-emerald-400 leading-tight">AI Study Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset conversation"
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" weight="regular" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" weight="regular" />
              </button>
            </div>
          </div>

          {/* Context badge */}
          {lessonTitle && (
            <div className="px-4 py-2 bg-emerald-900/30 border-b border-gray-700/50 shrink-0">
              <p className="text-[11px] text-emerald-400 truncate">
                <span className="text-gray-500">Now on:</span> {lessonTitle}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <LumiIcon size="sm" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-gray-800 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.content === "" && isStreaming && i === messages.length - 1 ? (
                    // Typing indicator
                    <span className="inline-flex items-center gap-1 py-0.5">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </span>
                  ) : msg.role === "assistant" ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800/80 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Lumi anything…"
                disabled={isStreaming}
                className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <PaperPlaneRight className="w-4 h-4" weight="regular" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5 text-center">
              Lumi can make mistakes — always verify important info.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
