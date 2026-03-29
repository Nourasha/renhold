"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteCompletionAction } from "@/app/dashboard/ferdige/actions";
import type { Completion, DailyNote } from "@/types";
import { getWeekKey, groupByDate, groupNotesByDate, getVisibleDates, filterCompletions } from "@/lib/utils";
import { WeekPagination } from "@/components/completed/WeekPagination";
import { ChecklistFilters } from "@/components/completed/ChecklistFilters";
import { DayCard } from "@/components/completed/DayCard";
import { useNotes } from "@/components/completed/useNotes";

interface Props {
  completions: Completion[];
  initialNotes: DailyNote[];
  currentUserId: string;
  today: string;
}

export function CompletedChecklist({ completions, initialNotes, currentUserId, today }: Props) {
  const [filterUser, setFilterUser] = useState("");
  const [filterWeek, setFilterWeek] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [localCompletions, setLocalCompletions] = useState<Completion[]>(completions);

  const notes = useNotes(initialNotes, currentUserId);

  useEffect(() => { setLocalCompletions(completions); }, [completions]);

  const allUsers = useMemo(
    () => Array.from(new Map(localCompletions.map((c) => [c.user.id, c.user.name || "Ukjent"])).entries()),
    [localCompletions],
  );

  const allWeekKeys = useMemo(
    () =>
      Array.from(new Set([
        ...localCompletions.map((c) => getWeekKey(c.date)),
        ...notes.notes.map((n) => getWeekKey(n.date)),
      ])).sort().reverse(),
    [localCompletions, notes.notes],
  );

  const allDates = useMemo(
    () =>
      Array.from(new Set([
        ...localCompletions.map((c) => c.date),
        ...notes.notes.map((n) => n.date),
      ])).sort().reverse(),
    [localCompletions, notes.notes],
  );

  const allUserIds = useMemo(
    () => Array.from(new Set(localCompletions.map((c) => c.user.id))),
    [localCompletions],
  );

  useEffect(() => {
    if (filterWeek || filterDate) return;
    if (allWeekKeys.length === 0) { setCurrentWeekIdx(0); return; }
    setCurrentWeekIdx((prev) => Math.min(Math.max(prev, 0), allWeekKeys.length - 1));
  }, [allWeekKeys, filterWeek, filterDate]);

  const currentWeekKey = filterWeek || allWeekKeys[currentWeekIdx] || "";
  const currentWeekNum = currentWeekKey ? parseInt(currentWeekKey.split("-W")[1], 10) : 0;
  const currentWeekYear = currentWeekKey ? parseInt(currentWeekKey.split("-W")[0], 10) : 0;

  async function handleDeleteCompletion(completionId: string) {
    if (!confirm("Vil du slette denne godkjenningen?")) return;
    setDeletingId(completionId);
    setLocalCompletions((prev) => prev.filter((c) => c.id !== completionId));
    await deleteCompletionAction(completionId);
    setDeletingId(null);
  }

  const filtered = filterCompletions(localCompletions, filterDate, filterUser, currentWeekKey, filterWeek);
  const byDate = groupByDate(filtered);
  const notesByDate = groupNotesByDate(notes.notes);
  const visibleDates = getVisibleDates(byDate, notesByDate, filterDate, currentWeekKey);

  if (localCompletions.length === 0 && notes.notes.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="mb-2 text-4xl">✅</p>
        <p className="text-sm">Ingen godkjente oppgaver ennå</p>
      </div>
    );
  }

  const paginationProps = {
    currentWeekNum,
    currentWeekYear,
    currentWeekIdx,
    totalWeeks: allWeekKeys.length,
    currentWeekKey,
    onPrev: () => setCurrentWeekIdx((i) => Math.min(i + 1, allWeekKeys.length - 1)),
    onNext: () => setCurrentWeekIdx((i) => Math.max(i - 1, 0)),
  };

  return (
    <div className="space-y-5">
      {!filterDate && !filterWeek && allWeekKeys.length > 0 && (
        <WeekPagination {...paginationProps} />
      )}

      <ChecklistFilters
        filterUser={filterUser}
        filterWeek={filterWeek}
        filterDate={filterDate}
        allUsers={allUsers}
        allWeekKeys={allWeekKeys}
        allDates={allDates}
        onUserChange={setFilterUser}
        onWeekChange={(v) => { setFilterWeek(v); setFilterDate(""); setCurrentWeekIdx(0); }}
        onDateChange={(v) => { setFilterDate(v); setFilterWeek(""); setCurrentWeekIdx(0); }}
        onReset={() => { setFilterUser(""); setFilterWeek(""); setFilterDate(""); setCurrentWeekIdx(0); }}
      />

      {visibleDates.length === 0 ? (
        <p className="text-sm text-gray-400">Ingen godkjente oppgaver denne uken</p>
      ) : (
        <div className="space-y-4">
          {visibleDates.map((date) => (
            <DayCard
              key={date}
              date={date}
              today={today}
              isNoteOpen={notes.noteOpen[date] || false}
              draft={notes.noteDrafts[date] ?? ""}
              myNote={notes.notes.find((n) => n.date === date && n.user.id === currentUserId)}
              dayNotes={notesByDate[date] || []}
              completionsByGroup={byDate[date] || {}}
              allUserIds={allUserIds}
              currentUserId={currentUserId}
              deletingId={deletingId}
              savingNote={notes.savingNote}
              onToggleNote={notes.openNoteEditor}
              onCloseNote={notes.closeNote}
              onDraftChange={notes.updateDraft}
              onSaveNote={notes.saveNote}
              onDeleteCompletion={handleDeleteCompletion}
            />
          ))}
        </div>
      )}

      {!filterDate && !filterWeek && allWeekKeys.length > 1 && (
        <WeekPagination {...paginationProps} />
      )}
    </div>
  );
}
