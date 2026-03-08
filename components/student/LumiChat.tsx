"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  PaperPlaneRight,
  Plus,
  ClockCounterClockwise,
  ChatCircle,
  Trash,
  CaretLeft,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════
// Lumi Owl Icon
// ═══════════════════════════════════════

function LumiIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "sm" ? 12 : size === "lg" ? 22 : 16;
  return (
    <svg width={px} height={px} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="13" r="10" fill="white" opacity="0.95" />
      <line x1="13.5" y1="12.5" x2="18.5" y2="12.5" stroke="white" strokeWidth="1.2" opacity="0.8" />
      <rect x="7" y="10" width="6" height="5" rx="2" stroke="white" strokeWidth="1.3" fill="none" opacity="0.9" />
      <rect x="19" y="10" width="6" height="5" rx="2" stroke="white" strokeWidth="1.3" fill="none" opacity="0.9" />
      <circle cx="10" cy="12.5" r="1.2" fill="white" opacity="0.95" />
      <circle cx="22" cy="12.5" r="1.2" fill="white" opacity="0.95" />
      <path d="M13 17 Q16 19.5 19 17" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
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

interface ChatSession {
  id: string;
  courseTitle: string;
  lessonTitle: string | null;
  lessonType: string | null;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface LumiChatProps {
  courseTitle?: string;
  lessonTitle?: string | null;
  lessonType?: string | null;
}

const STORAGE_KEY = "lumi_chat_sessions";

// ═══════════════════════════════════════
// Markdown renderer
// ═══════════════════════════════════════

function renderMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, "").replace(/```$/, "");
      return `<pre class="bg-gray-950 text-emerald-300 text-xs p-2 rounded-lg my-1 overflow-x-auto whitespace-pre-wrap">${escapeHtml(code.trim())}</pre>`;
    })
    .replace(/`([^`]+)`/g, '<code class="bg-gray-950 text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function newSessionId(): string {
  return `lumi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ═══════════════════════════════════════
// Storage helpers
// ═══════════════════════════════════════

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    // Keep max 50 sessions, most recent first
    const trimmed = sessions.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function LumiChat({
  courseTitle = "PathWise",
  lessonTitle = null,
  lessonType = null,
}: LumiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active session derived
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  // ── Load sessions from localStorage on mount ──
  useEffect(() => {
    const stored = loadSessions();
    setSessions(stored);
  }, []);

  // ── When chat opens, either resume existing session for this lesson or create new ──
  useEffect(() => {
    if (!isOpen) return;
    const stored = loadSessions();
    setSessions(stored);

    // Find most recent session matching current course+lesson
    const existing = stored.find(
      (s) => s.courseTitle === courseTitle && s.lessonTitle === lessonTitle
    );

    if (existing) {
      setActiveSessionId(existing.id);
    } else {
      startNewSession(stored, false);
    }
    setView("chat");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input when chat opens ──
  useEffect(() => {
    if (isOpen && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, view]);

  // ── Persist sessions whenever they change ──
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  const buildWelcome = useCallback((ct: string, lt: string | null): Message => ({
    role: "assistant",
    content: `Hi! I'm **Lumi**, your AI study assistant for **${ct}**. ${lt ? `I can see you're on "${lt}" — ` : ""}Ask me anything and I'll help you learn! 🎓`,
  }), []);

  function startNewSession(existingSessions: ChatSession[], switchToIt = true) {
    const id = newSessionId();
    const welcome = buildWelcome(courseTitle, lessonTitle);
    const newSession: ChatSession = {
      id,
      courseTitle,
      lessonTitle,
      lessonType,
      messages: [welcome],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newSession, ...existingSessions];
    setSessions(updated);
    saveSessions(updated);
    if (switchToIt) {
      setActiveSessionId(id);
      setView("chat");
    } else {
      setActiveSessionId(id);
    }
  }

  function updateSessionMessages(sessionId: string, updater: (msgs: Message[]) => Message[]) {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: updater(s.messages), updatedAt: Date.now() }
          : s
      );
      saveSessions(updated);
      return updated;
    });
  }

  function deleteSession(id: string) {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      if (activeSessionId === id) {
        const next = updated[0];
        if (next) setActiveSessionId(next.id);
        else startNewSession(updated);
      }
      return updated;
    });
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || !activeSessionId) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setInput("");
    setIsStreaming(true);

    // Append user message + empty assistant placeholder
    updateSessionMessages(activeSessionId, (prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);

    const currentMessages = [...messages, userMessage];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          courseContext: { courseTitle, lessonTitle, lessonType },
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Failed to connect to Lumi" }));
        updateSessionMessages(activeSessionId, (prev) => {
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
        updateSessionMessages(activeSessionId, (prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      }
    } catch {
      updateSessionMessages(activeSessionId, (prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't reach Lumi. Make sure Ollama is running and try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, activeSessionId, messages, courseTitle, lessonTitle, lessonType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group sessions by course for history view
  const grouped = sessions.reduce<Record<string, ChatSession[]>>((acc, s) => {
    const key = s.courseTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

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
          style={{ width: "min(400px, calc(100vw - 3rem))", height: "min(580px, calc(100vh - 8rem))" }}
        >
          {/* ─── HEADER ─── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800 shrink-0">
            <div className="flex items-center gap-2.5">
              {view === "history" && (
                <button
                  onClick={() => setView("chat")}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <CaretLeft className="w-4 h-4" weight="bold" />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                <LumiIcon size="md" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Lumi</p>
                <p className="text-[10px] text-emerald-400 leading-tight">
                  {view === "history" ? "Chat History" : "AI Study Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* New chat */}
              <button
                onClick={() => startNewSession(sessions)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="New chat"
              >
                <Plus className="w-3.5 h-3.5" weight="bold" />
              </button>
              {/* History */}
              <button
                onClick={() => setView(view === "history" ? "chat" : "history")}
                className={`p-1.5 rounded-lg transition-colors ${view === "history" ? "text-emerald-400 bg-gray-700" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                title="Chat history"
              >
                <ClockCounterClockwise className="w-3.5 h-3.5" weight="regular" />
              </button>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" weight="regular" />
              </button>
            </div>
          </div>

          {/* ─── HISTORY VIEW ─── */}
          {view === "history" ? (
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <ChatCircle className="w-10 h-10 text-gray-700 mb-3" weight="thin" />
                  <p className="text-sm text-gray-500">No chat history yet.</p>
                  <p className="text-xs text-gray-600 mt-1">Start a conversation with Lumi!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {Object.entries(grouped).map(([course, courseSessions]) => (
                    <div key={course}>
                      {/* Course group header */}
                      <div className="px-4 py-2 bg-gray-800/60 sticky top-0">
                        <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider truncate">
                          {course}
                        </p>
                      </div>
                      {courseSessions.map((s) => {
                        const preview = s.messages.find((m) => m.role === "user")?.content ?? "New conversation";
                        const isActive = s.id === activeSessionId;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { setActiveSessionId(s.id); setView("chat"); }}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-800/50 transition-colors group ${isActive ? "bg-gray-800" : ""}`}
                          >
                            <ChatCircle className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-emerald-400" : "text-gray-500"}`} weight="regular" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-300 truncate">
                                {preview.length > 60 ? preview.slice(0, 60) + "…" : preview}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {s.lessonTitle && (
                                  <span className="text-[10px] text-gray-600 truncate max-w-35">
                                    {s.lessonTitle}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-700">{timeAgo(s.updatedAt)}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                              className="p-1 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                              title="Delete chat"
                            >
                              <Trash className="w-3.5 h-3.5" weight="regular" />
                            </button>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ─── LESSON CONTEXT BADGE ─── */}
              {lessonTitle && (
                <div className="px-4 py-2 bg-emerald-900/30 border-b border-gray-700/50 shrink-0">
                  <p className="text-[11px] text-emerald-400 truncate">
                    <span className="text-gray-500">Now on:</span> {lessonTitle}
                  </p>
                </div>
              )}

              {/* ─── MESSAGES ─── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <LumiIcon size="sm" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-sm"
                          : "bg-gray-800 text-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.content === "" && isStreaming && i === messages.length - 1 ? (
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
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── INPUT ─── */}
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
            </>
          )}
        </div>
      )}
    </>
  );
}
