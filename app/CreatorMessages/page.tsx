"use client";

import { useState, useEffect, useRef } from "react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import {
  PaperPlaneRight,
  CircleNotch,
  ChatCircleDots,
  UserCircle,
  ArrowLeft,
  Circle,
} from "@phosphor-icons/react";

interface Conversation {
  threadId: string;
  otherUser: { id: string; name: string | null; image: string | null; role: string };
  lastMessage: { content: string; createdAt: string; senderId: string };
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  subject: string | null;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
  receiver: { id: string; name: string | null; image: string | null };
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function CreatorMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // Get current user id from session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setUserId(data?.user?.id || ""));
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function openThread(threadId: string) {
    setActiveThread(threadId);
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/messages/${encodeURIComponent(threadId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.threadId === threadId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error("Failed to fetch thread:", err);
    } finally {
      setMessagesLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeThread || sending) return;
    const activeConvo = conversations.find((c) => c.threadId === activeThread);
    if (!activeConvo) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeConvo.otherUser.id,
          content: newMessage.trim(),
          threadId: activeThread,
        }),
      });
      if (res.ok) {
        setNewMessage("");
        openThread(activeThread);
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  }

  const activeConvo = conversations.find((c) => c.threadId === activeThread);

  return (
    <CreatorLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Private conversations with your students</p>
        </div>

        <div className="flex-1 flex bg-white border border-gray-200 rounded-xl overflow-hidden min-h-0">
          {/* Conversation list */}
          <div
            className={`w-full md:w-80 border-r border-gray-200 flex flex-col shrink-0 ${
              activeThread ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Conversations ({conversations.length})
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <CircleNotch className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                <ChatCircleDots className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No conversations yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) => (
                  <button
                    key={convo.threadId}
                    onClick={() => openThread(convo.threadId)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                      activeThread === convo.threadId ? "bg-blue-50" : ""
                    }`}
                  >
                    {convo.otherUser.image ? (
                      <img
                        src={convo.otherUser.image}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <UserCircle className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {convo.otherUser.name || "Student"}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {timeAgo(convo.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {convo.lastMessage.senderId === userId ? "You: " : ""}
                        {convo.lastMessage.content}
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                        {convo.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message thread */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${
              activeThread ? "flex" : "hidden md:flex"
            }`}
          >
            {!activeThread ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
                <ChatCircleDots className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                  <button
                    onClick={() => setActiveThread(null)}
                    className="md:hidden text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {activeConvo?.otherUser.image ? (
                    <img
                      src={activeConvo.otherUser.image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeConvo?.otherUser.name || "Student"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {activeConvo?.otherUser.role?.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <CircleNotch className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-900 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isMe ? "text-blue-200" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      {sending ? (
                        <CircleNotch className="w-4 h-4 animate-spin" />
                      ) : (
                        <PaperPlaneRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
