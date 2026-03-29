"use client";

import { useEffect, useState } from "react";
import type { DailyNote } from "@/types";

export function useNotes(initialNotes: DailyNote[], currentUserId: string) {
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  async function saveNote(date: string) {
    const content = noteDrafts[date]?.trim();
    if (!content) return;

    setSavingNote(date);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, date }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => [
        data.note,
        ...prev.filter((n) => !(n.date === date && n.user.id === currentUserId)),
      ]);
      setNoteDrafts((prev) => ({ ...prev, [date]: "" }));
      setNoteOpen((prev) => ({ ...prev, [date]: false }));
    }

    setSavingNote(null);
  }

  function openNoteEditor(date: string) {
    const existing = notes.find((n) => n.date === date && n.user.id === currentUserId);
    setNoteDrafts((prev) => ({ ...prev, [date]: existing?.content || "" }));
    setNoteOpen((prev) => ({ ...prev, [date]: true }));
  }

  return {
    notes,
    noteDrafts,
    savingNote,
    noteOpen,
    saveNote,
    openNoteEditor,
    closeNote: (date: string) => setNoteOpen((prev) => ({ ...prev, [date]: false })),
    updateDraft: (date: string, value: string) => setNoteDrafts((prev) => ({ ...prev, [date]: value })),
  };
}
