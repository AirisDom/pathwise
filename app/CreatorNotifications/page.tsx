"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreatorLayout from "@/components/creator/CreatorLayout";
import {
  Bell,
  UserPlus,
  Trophy,
  ChatCircleDots,
  Star,
  MegaphoneSimple,
  CircleNotch,
  Checks,
  BellSlash,
} from "@phosphor-icons/react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function getIcon(type: string) {
  switch (type) {
    case "ENROLLMENT":
      return <UserPlus className="w-5 h-5 text-blue-600" />;
    case "ACHIEVEMENT":
      return <Trophy className="w-5 h-5 text-amber-500" />;
    case "NEW_MESSAGE":
      return <ChatCircleDots className="w-5 h-5 text-violet-500" />;
    case "NEW_REVIEW":
      return <Star className="w-5 h-5 text-amber-400" />;
    case "COURSE_UPDATE":
      return <MegaphoneSimple className="w-5 h-5 text-emerald-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400" />;
  }
}

function getIconBg(type: string) {
  switch (type) {
    case "ENROLLMENT":
      return "bg-blue-50";
    case "ACHIEVEMENT":
      return "bg-amber-50";
    case "NEW_MESSAGE":
      return "bg-violet-50";
    case "NEW_REVIEW":
      return "bg-amber-50";
    case "COURSE_UPDATE":
      return "bg-emerald-50";
    default:
      return "bg-gray-50";
  }
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
}

export default function CreatorNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/creator/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/creator/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }

  async function handleClick(notif: Notification) {
    // Mark single as read
    if (!notif.isRead) {
      try {
        await fetch("/api/creator/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link) router.push(notif.link);
  }

  const displayed = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Checks className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500">Loading notifications...</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <BellSlash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-gray-500">
              {filter === "unread"
                ? "You've read all your notifications."
                : "Notifications will appear when students enroll or complete your courses."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {displayed.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${
                  !notif.isRead ? "bg-blue-50/40 border-l-3 border-l-blue-500" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(
                    notif.type
                  )}`}
                >
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        !notif.isRead ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
