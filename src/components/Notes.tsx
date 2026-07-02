import { useState } from 'react';
import type { Note } from '../types';
import { loadNotes, saveNotes } from '../lib/storage';

const LIME = '#00FF49';

function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes());
  const [openId, setOpenId] = useState<string | null>(null);

  function persist(next: Note[]) {
    setNotes(next);
    saveNotes(next);
  }

  function newNote() {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      createdAt: now,
      updatedAt: now,
    };
    persist([note, ...notes]);
    setOpenId(note.id);
  }

  function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) {
    persist(
      notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    );
  }

  function deleteNote(id: string) {
    persist(notes.filter((n) => n.id !== id));
    if (openId === id) setOpenId(null);
  }

  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <div>
          <h2 className="text-xl font-semibold">Notes</h2>
          <p className="text-xs text-neutral-500">Your private notes. Only on this device.</p>
        </div>
        <button
          onClick={newNote}
          className="rounded-full px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          style={{ background: LIME }}
        >
          + New Note
        </button>
      </header>

      {sorted.length === 0 && (
        <p className="px-4 py-10 text-center text-neutral-600">
          No notes yet. Tap + New Note to write your first one.
        </p>
      )}

      <div className="flex flex-col gap-3 p-4">
        {sorted.map((note) => {
          const open = openId === note.id;
          return (
            <div
              key={note.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-950 transition-colors"
              style={open ? { borderColor: LIME, boxShadow: '0 0 16px rgba(0,255,73,0.25)' } : undefined}
            >
              {open ? (
                <div className="p-4">
                  <input
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    placeholder="Title"
                    autoFocus
                    className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-neutral-600"
                  />
                  <textarea
                    value={note.body}
                    onChange={(e) => updateNote(note.id, { body: e.target.value })}
                    placeholder="Write your note..."
                    rows={6}
                    className="mt-2 w-full resize-none bg-transparent text-base outline-none placeholder:text-neutral-600"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-xs text-neutral-500 transition-colors hover:text-[#FA00FF]"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setOpenId(null)}
                      className="rounded-full border px-4 py-1.5 text-xs font-semibold transition hover:opacity-80"
                      style={{ borderColor: LIME, color: LIME }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setOpenId(note.id)}
                  className="w-full cursor-pointer p-4 text-left"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-lg font-semibold">
                      {note.title || 'Untitled'}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-600">
                      {formatTime(note.updatedAt)}
                    </span>
                  </div>
                  {note.body && (
                    <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-neutral-400">
                      {note.body}
                    </p>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
