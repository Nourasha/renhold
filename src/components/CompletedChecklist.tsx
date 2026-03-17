"use client";
// src/components/CompletedChecklist.tsx
import { useState } from "react";

interface Completion {
  id: string;
  completedAt: string | Date;
  date: string;
  user: { id: string; name: string | null };
  item: {
    id: string;
    label: string;
    group: { title: string; color: string };
  };
}

interface DailyNote {
  id: string;
  content: string;
  date: string;
  user: { id: string; name: string | null };
}

interface Props {
  completions: Completion[];
  initialNotes: DailyNote[];
  currentUserId: string;
  today: string;
}

const groupHeaderColors: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  green:  "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
  orange: "bg-orange-500 text-white",
  red:    "bg-red-600 text-white",
  yellow: "bg-yellow-500 text-white",
};
const groupBorderColors: Record<string, string> = {
  blue:   "border-blue-200",
  green:  "border-green-200",
  purple: "border-purple-200",
  orange: "border-orange-200",
  red:    "border-red-200",
  yellow: "border-yellow-200",
};

const userColors = [
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-pink-500",   text: "text-white" },
  { bg: "bg-teal-500",   text: "text-white" },
  { bg: "bg-amber-500",  text: "text-white" },
  { bg: "bg-cyan-600",   text: "text-white" },
  { bg: "bg-rose-500",   text: "text-white" },
  { bg: "bg-lime-600",   text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
];

function getUserColorClass(userId: string, allIds: string[]) {
  const idx = allIds.indexOf(userId);
  const c = userColors[idx % userColors.length] || { bg: "bg-gray-500", text: "text-white" };
  return `${c.bg} ${c.text}`;
}

const DAYS_NO = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const day = DAYS_NO[d.getDay()];
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  return Math.ceil((diff / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);
}

export function CompletedChecklist({ completions, initialNotes, currentUserId, today }: Props) {
  const [items, setItems] = useState<Completion[]>(completions);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterWeek, setFilterWeek] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notes state
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});

  const allUserIds = Array.from(new Set(items.map((c) => c.user.id)));
  const allUsers = Array.from(
    new Map(items.map((c) => [c.user.id, c.user.name || "Ukjent"])).entries()
  );
  const allDates = Array.from(
    new Set([...items.map((c) => c.date), ...notes.map((n) => n.date)])
  ).sort().reverse();

  // All unique week numbers
  const allWeeks = Array.from(
    new Set(items.map((c) => getWeekNumber(c.date)))
  ).sort((a, b) => b - a);

  async function handleDeleteCompletion(completionId: string) {
    if (!confirm("Vil du slette denne godkjenningen?")) return;
    setDeletingId(completionId);
    const res = await fetch(`/api/checklist/complete/${completionId}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== completionId));
    }
    setDeletingId(null);
  }

  // Filter
  const filtered = items.filter((c) => {
    if (filterDate && c.date !== filterDate) return false;
    if (filterUser && c.user.id !== filterUser) return false;
    if (filterWeek && getWeekNumber(c.date) !== parseInt(filterWeek)) return false;
    return true;
  });

  // Group by date → group title → item label → completions (multiple users per item)
  const byDate = filtered.reduce<Record<string, Record<string, Record<string, Completion[]>>>>(
    (acc, c) => {
      if (!acc[c.date]) acc[c.date] = {};
      const gt = c.item.group.title;
      if (!acc[c.date][gt]) acc[c.date][gt] = {};
      const label = c.item.label;
      if (!acc[c.date][gt][label]) acc[c.date][gt][label] = [];
      acc[c.date][gt][label].push(c);
      return acc;
    },
    {}
  );

  const notesByDate = notes.reduce<Record<string, DailyNote[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  const visibleDates = Array.from(
    new Set([
      ...Object.keys(byDate),
      ...(filterDate || filterWeek ? [] : Object.keys(notesByDate)),
    ])
  ).sort().reverse();

  function myNoteForDate(date: string) {
    return notes.find((n) => n.date === date && n.user.id === currentUserId);
  }

  async function saveNote(date: string) {
    const content = noteDrafts[date]?.trim();
    if (!content) return;
    setSavingNote(date);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, date }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => {
        const without = prev.filter((n) => !(n.date === date && n.user.id === currentUserId));
        return [data.note, ...without];
      });
      setNoteDrafts((prev) => ({ ...prev, [date]: "" }));
      setNoteOpen((prev) => ({ ...prev, [date]: false }));
    }
    setSavingNote(null);
  }

  function openNoteEditor(date: string) {
    const existing = myNoteForDate(date);
    setNoteDrafts((prev) => ({ ...prev, [date]: existing?.content || "" }));
    setNoteOpen((prev) => ({ ...prev, [date]: true }));
  }

  const hasAnyFilter = filterDate || filterUser || filterWeek;

  if (items.length === 0 && notes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-2">✅</p>
        <p className="text-sm">Ingen godkjente oppgaver ennå</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Week filter */}
        <select
          value={filterWeek}
          onChange={(e) => { setFilterWeek(e.target.value); setFilterDate(""); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle uker</option>
          {allWeeks.map((w) => (
            <option key={w} value={w}>Uke {w}</option>
          ))}
        </select>

        {/* Date filter */}
        <select
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setFilterWeek(""); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle datoer</option>
          {allDates.map((d) => (
            <option key={d} value={d}>{formatDate(d)}</option>
          ))}
        </select>

        {/* User filter */}
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle brukere</option>
          {allUsers.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        {hasAnyFilter && (
          <button
            onClick={() => { setFilterDate(""); setFilterUser(""); setFilterWeek(""); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Nullstill filter
          </button>
        )}
      </div>

      {visibleDates.length === 0 ? (
        <p className="text-gray-400 text-sm">Ingen resultater for dette filteret</p>
      ) : (
        visibleDates.map((date) => {
          const dayNotes = notesByDate[date] || [];
          const myNote = myNoteForDate(date);
          const isNoteOpen = noteOpen[date] || false;
          const draft = noteDrafts[date] ?? "";
          const isToday = date === today;
          const weekNum = getWeekNumber(date);

          return (
            <div key={date} className="space-y-3">
              {/* Date header */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-base font-bold text-gray-700 flex items-center gap-2 flex-wrap">
                  <span className="text-lg">📅</span>
                  {formatDate(date)}
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    Uke {weekNum}
                  </span>
                  {isToday && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                      I dag
                    </span>
                  )}
                </h3>

                {!isNoteOpen && (
                  <button
                    onClick={() => openNoteEditor(date)}
                    className="text-sm px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                  >
                    <span>📝</span>
                    {myNote ? "Rediger notat" : "Legg til notat"}
                  </button>
                )}
              </div>

              {/* Note editor */}
              {isNoteOpen && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-yellow-800">
                    📝 Ditt notat for {formatDate(date)}
                  </p>
                  <textarea
                    value={draft}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [date]: e.target.value }))}
                    rows={3}
                    placeholder="Skriv hva du har gjort i dag, spesifikasjoner, avvik..."
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveNote(date)}
                      disabled={!draft.trim() || savingNote === date}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {savingNote === date ? "Lagrer..." : "Lagre notat"}
                    </button>
                    <button
                      onClick={() => setNoteOpen((prev) => ({ ...prev, [date]: false }))}
                      className="px-4 py-2 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {dayNotes.length > 0 && (
                <div className="space-y-2">
                  {dayNotes.map((note) => (
                    <div key={note.id} className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 flex gap-3">
                      <span className="text-yellow-400 flex-shrink-0">📝</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getUserColorClass(note.user.id, allUserIds)}`}>
                            {note.user.name || "Ukjent"}
                          </span>
                          {note.user.id === currentUserId && (
                            <button onClick={() => openNoteEditor(date)} className="text-xs text-yellow-600 hover:underline">
                              Rediger
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checklist completions — grouped by category, then by item (multiple users per row) */}
              {byDate[date] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(byDate[date]).map(([groupTitle, itemMap]) => {
                    const firstCompletion = Object.values(itemMap)[0]?.[0];
                    const color = firstCompletion?.item.group.color || "blue";
                    const headerCls = groupHeaderColors[color] || groupHeaderColors.blue;
                    const borderCls = groupBorderColors[color] || groupBorderColors.blue;

                    return (
                      <div key={groupTitle} className={`rounded-xl border-2 overflow-hidden shadow-sm ${borderCls}`}>
                        <div className={`px-4 py-2.5 ${headerCls}`}>
                          <h4 className="font-bold text-sm">{groupTitle}</h4>
                        </div>
                        <div className="bg-white p-3 space-y-2">
                          {Object.entries(itemMap).map(([label, completionsForItem]) => {
                            // Check if current user has a completion for this item
                            const myCompletion = completionsForItem.find(
                              (c) => c.user.id === currentUserId
                            );

                            return (
                              <div key={label} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-green-500 flex-shrink-0">✓</span>
                                  <span className="text-sm text-gray-800 truncate">{label}</span>
                                </div>

                                {/* All users who completed this item — side by side */}
                                <div className="flex items-center gap-1 flex-wrap justify-end flex-shrink-0">
                                  {completionsForItem.map((c) => (
                                    <div key={c.id} className="flex items-center gap-0.5">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${getUserColorClass(c.user.id, allUserIds)}`}>
                                        {c.user.name || "Ukjent"}
                                      </span>
                                      {/* Delete button — only for own completions */}
                                      {c.user.id === currentUserId && (
                                        <button
                                          onClick={() => handleDeleteCompletion(c.id)}
                                          disabled={deletingId === c.id}
                                          className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none ml-0.5 disabled:opacity-40"
                                          title="Slett min godkjenning"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
