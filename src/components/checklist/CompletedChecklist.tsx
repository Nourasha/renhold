"use client";
// src/components/checklist/CompletedChecklist.tsx
import { useState } from "react";
import { Completion, DailyNote, getWeekKey } from "./completed/types";
import { WeekPagination } from "./completed/WeekPagination";
import { ChecklistFilters } from "./completed/ChecklistFilters";
import { DayCard } from "./completed/DayCard";
import { groupByDate, groupNotesByDate, getVisibleDates, filterCompletions } from "./completedHelpers";

interface Props {
  completions: Completion[];
  initialNotes: DailyNote[];
  currentUserId: string;
  today: string;
}

export function CompletedChecklist({ completions, initialNotes, currentUserId, today }: Props) {
  const [items, setItems] = useState<Completion[]>(completions);
  const [filterUser, setFilterUser] = useState("");
  const [filterWeek, setFilterWeek] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});

  const allUsers = Array.from(new Map(items.map((c) => [c.user.id, c.user.name || "Ukjent"])).entries());
  const allWeekKeys = Array.from(new Set([
    ...items.map((c) => getWeekKey(c.date)),
    ...notes.map((n) => getWeekKey(n.date)),
  ])).sort().reverse();
  const allDates = Array.from(new Set([...items.map((c) => c.date), ...notes.map((n) => n.date)])).sort().reverse();
  const allUserIds = Array.from(new Set(items.map((c) => c.user.id)));

  const currentWeekKey = filterWeek || allWeekKeys[currentWeekIdx] || "";
  const currentWeekNum = currentWeekKey ? parseInt(currentWeekKey.split("-W")[1]) : 0;
  const currentWeekYear = currentWeekKey ? parseInt(currentWeekKey.split("-W")[0]) : 0;

  async function handleDeleteCompletion(completionId: string) {
    if (!confirm("Vil du slette denne godkjenningen?")) return;
    setDeletingId(completionId);
    const res = await fetch(`/api/checklist/complete/${completionId}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((c) => c.id !== completionId));
    setDeletingId(null);
  }

  async function saveNote(date: string) {
    const content = noteDrafts[date]?.trim();
    if (!content) return;
    setSavingNote(date);
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, date }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev.filter((n) => !(n.date === date && n.user.id === currentUserId))]);
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

  const filtered = filterCompletions(items, filterDate, filterUser, currentWeekKey, filterWeek);
  const byDate = groupByDate(filtered);
  const notesByDate = groupNotesByDate(notes);
  const visibleDates = getVisibleDates(byDate, notesByDate, filterDate, currentWeekKey);

  if (items.length === 0 && notes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-2">✅</p>
        <p className="text-sm">Ingen godkjente oppgaver ennå</p>
      </div>
    );
  }

  const paginationProps = {
    currentWeekNum, currentWeekYear, currentWeekIdx,
    totalWeeks: allWeekKeys.length, currentWeekKey,
    onPrev: () => setCurrentWeekIdx((i) => Math.min(i + 1, allWeekKeys.length - 1)),
    onNext: () => setCurrentWeekIdx((i) => Math.max(i - 1, 0)),
  };

  return (
    <div className="space-y-5">
      {!filterDate && !filterWeek && <WeekPagination {...paginationProps} />}
      <ChecklistFilters
        filterUser={filterUser} filterWeek={filterWeek} filterDate={filterDate}
        allUsers={allUsers} allWeekKeys={allWeekKeys} allDates={allDates}
        onUserChange={setFilterUser}
        onWeekChange={(v) => { setFilterWeek(v); setFilterDate(""); }}
        onDateChange={(v) => { setFilterDate(v); setFilterWeek(""); }}
        onReset={() => { setFilterUser(""); setFilterWeek(""); setFilterDate(""); }}
      />
      {visibleDates.length === 0 ? (
        <p className="text-gray-400 text-sm">Ingen godkjente oppgaver denne uken</p>
      ) : (
        <div className="space-y-4">
          {visibleDates.map((date) => (
            <DayCard
              key={date} date={date} today={today}
              isNoteOpen={noteOpen[date] || false}
              draft={noteDrafts[date] ?? ""}
              myNote={notes.find((n) => n.date === date && n.user.id === currentUserId)}
              dayNotes={notesByDate[date] || []}
              completionsByGroup={byDate[date] || {}}
              allUserIds={allUserIds} currentUserId={currentUserId}
              deletingId={deletingId} savingNote={savingNote}
              onToggleNote={openNoteEditor}
              onCloseNote={(d) => setNoteOpen((prev) => ({ ...prev, [d]: false }))}
              onDraftChange={(d, v) => setNoteDrafts((prev) => ({ ...prev, [d]: v }))}
              onSaveNote={saveNote}
              onDeleteCompletion={handleDeleteCompletion}
            />
          ))}
        </div>
      )}
      {!filterDate && !filterWeek && allWeekKeys.length > 1 && <WeekPagination {...paginationProps} />}
    </div>
  );
}
