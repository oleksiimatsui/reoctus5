"use client";

import { useEffect, useState } from "react";

type Note = {
  id: string;
  content: string;
  createdAt: string;
};

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notes");

      if (!response.ok) {
        throw new Error("Failed to load notes", {});
      }

      const notesData: Note[] = await response.json();
      setNotes(
        notesData.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      );
    } catch (err) {
      setError(
        "Unable to load notes. Check your MongoDB connection and try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to save note");
      }
      setContent("");
      await loadNotes();
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-neutral-900/10 p-4 w-full h-full flex flex-col">
      <div className="grow overflow-y-auto">
        {loading ? (
          <p>Loading notes…</p>
        ) : notes.length === 0 && !error ? (
          <p>No notes yet. Add one above.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {notes.map((note) => (
              <p key={note.id} className="mt-3 w-full wrap break-words">
                {note.content}
              </p>
            ))}
          </div>
        )}
      </div>

      <form className=" space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-2 ">
          <textarea
            maxLength={100}
            className="grow resize-none rounded-2xl bg-neutral-900/10 px-4 py-3 outline-none scrollbar-black"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your note here"
          />
          <button type="submit" disabled={saving || !content.trim()}>
            {saving ? "Saving..." : "Sent"}
          </button>
        </div>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </div>
  );
}
