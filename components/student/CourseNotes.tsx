"use client";

import { useState, useEffect } from "react";
import {
  StickyNote,
  Plus,
  Loader2,
  Trash2,
  Edit3,
  Save,
  X,
  Clock,
  FileText,
} from "lucide-react";

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
  updatedAt: string;
  lesson: {
    id: string;
    title: string;
    order: number;
    section: { title: string; order: number };
  };
}

interface CourseNotesProps {
  courseId: string;
  activeLessonId: string | null;
  activeLessonTitle: string | null;
  currentVideoTime?: number;
  onSeekTo?: (time: number) => void;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CourseNotes({
  courseId,
  activeLessonId,
  activeLessonTitle,
  currentVideoTime,
  onSeekTo,
}: CourseNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false); // false = current lesson only
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // New note form
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [courseId, activeLessonId, showAll]);

  async function fetchNotes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ courseId });
      if (!showAll && activeLessonId) {
        params.set("lessonId", activeLessonId);
      }
      const res = await fetch(`/api/student/notes?${params}`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.data);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createNote() {
    if (!newContent.trim() || !activeLessonId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/student/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: activeLessonId,
          content: newContent.trim(),
          timestamp:
            includeTimestamp && currentVideoTime != null
              ? Math.floor(currentVideoTime)
              : null,
        }),
      });
      if (res.ok) {
        setNewContent("");
        setShowNew(false);
        fetchNotes();
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  }

  async function updateNote(noteId: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/student/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchNotes();
      }
    } catch (err) {
      console.error("Failed to update note:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId: string) {
    try {
      const res = await fetch(`/api/student/notes/${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-400" />
            Your Notes
          </h3>
          <div className="flex items-center gap-2">
            {/* Toggle scope */}
            <div className="flex bg-gray-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setShowAll(false)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  !showAll
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                This Lesson
              </button>
              <button
                onClick={() => setShowAll(true)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  showAll
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                All Notes
              </button>
            </div>
          </div>
        </div>

        {/* Add note button */}
        {activeLessonId && !showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-700 hover:border-emerald-600 text-gray-400 hover:text-emerald-400 rounded-lg text-sm transition-colors mb-4"
          >
            <Plus className="w-4 h-4" />
            Add a note
            {currentVideoTime != null && currentVideoTime > 0 && (
              <span className="text-xs text-gray-600">
                at {formatTimestamp(Math.floor(currentVideoTime))}
              </span>
            )}
          </button>
        )}

        {/* New note form */}
        {showNew && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 space-y-3">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Type your note..."
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
              maxLength={5000}
            />

            {currentVideoTime != null && currentVideoTime > 0 && (
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                />
                Save with timestamp ({formatTimestamp(Math.floor(currentVideoTime))})
              </label>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={createNote}
                disabled={!newContent.trim() || saving}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowNew(false);
                  setNewContent("");
                }}
                className="px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-800/50 rounded-lg p-4 group"
              >
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateNote(note.id)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Show lesson name when viewing all notes */}
                        {showAll && (
                          <p className="text-[11px] text-emerald-400 font-medium mb-1">
                            {note.lesson.section.title} &gt;{" "}
                            {note.lesson.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(note.id);
                            setEditContent(note.content);
                          }}
                          className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      {note.timestamp != null && (
                        <button
                          onClick={() => onSeekTo?.(note.timestamp!)}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(note.timestamp)}
                        </button>
                      )}
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {showAll
                ? "You haven't taken any notes yet."
                : "No notes for this lesson."}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Click &quot;Add a note&quot; to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
