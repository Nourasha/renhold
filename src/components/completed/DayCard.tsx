import type { Completion, DailyNote } from "@/types";
import {
  DAY_COLORS,
  groupStyles,
  formatDate,
  getWeekNumber,
  getUserColorBg,
} from "@/lib/utils";

interface Props {
  date: string;
  today: string;
  isNoteOpen: boolean;
  draft: string;
  myNote: DailyNote | undefined;
  dayNotes: DailyNote[];
  completionsByGroup: Record<string, Record<string, Completion[]>>;
  allUserIds: string[];
  currentUserId: string;
  deletingId: string | null;
  savingNote: string | null;
  onToggleNote: (date: string) => void;
  onCloseNote: (date: string) => void;
  onDraftChange: (date: string, value: string) => void;
  onSaveNote: (date: string) => void;
  onDeleteCompletion: (id: string) => void;
}

function getUtcDayIndex(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function DayCard({
  date,
  today,
  isNoteOpen,
  draft,
  myNote,
  dayNotes,
  completionsByGroup,
  allUserIds,
  currentUserId,
  deletingId,
  savingNote,
  onToggleNote,
  onCloseNote,
  onDraftChange,
  onSaveNote,
  onDeleteCompletion,
}: Props) {
  const isToday = date === today;
  const weekNum = getWeekNumber(date);
  const dayOfWeek = getUtcDayIndex(date);
  const dayColor = DAY_COLORS[dayOfWeek];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3 ${
          isToday ? "bg-blue-100" : dayColor.bg
        }`}
      >
        <h3
          className={`flex flex-wrap items-center gap-2 font-bold ${
            isToday ? "text-blue-800" : dayColor.text
          }`}
        >
          <span className="text-lg">📅</span>
          {formatDate(date)}
          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
            Uke {weekNum}
          </span>
          {isToday && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
              I dag
            </span>
          )}
        </h3>

        {!isNoteOpen && (
          <button
            onClick={() => onToggleNote(date)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-white"
          >
            <span>📝</span>
            {myNote ? "Rediger notat" : "Legg til notat"}
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {isNoteOpen && (
          <div className="space-y-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-800">
              📝 Ditt notat for {formatDate(date)}
            </p>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(date, e.target.value)}
              rows={3}
              placeholder="Skriv hva du har gjort i dag, spesifikasjoner, avvik..."
              className="w-full resize-none rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveNote(date)}
                disabled={!draft.trim() || savingNote === date}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
              >
                {savingNote === date ? "Lagrer..." : "Lagre notat"}
              </button>
              <button
                onClick={() => onCloseNote(date)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {dayNotes.length > 0 && (
          <div className="space-y-2">
            {dayNotes.map((note) => (
              <div
                key={note.id}
                className="flex gap-3 rounded-lg border border-yellow-100 bg-yellow-50 px-4 py-3"
              >
                <span className="flex-shrink-0 text-yellow-400">📝</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${getUserColorBg(
                        note.user.id,
                        allUserIds,
                      )}`}
                    >
                      {note.user.name || "Ukjent"}
                    </span>
                    {note.user.id === currentUserId && (
                      <button
                        onClick={() => onToggleNote(date)}
                        className="text-xs text-yellow-600 hover:underline"
                      >
                        Rediger
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {Object.keys(completionsByGroup).length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(completionsByGroup).map(([groupTitle, itemMap]) => {
              const firstCompletion = Object.values(itemMap)[0]?.[0];
              const color = firstCompletion?.item.group.color || "blue";
              const style = groupStyles[color] || groupStyles.blue;
              const headerCls = style.header;
              const borderCls = style.border;

              return (
                <div
                  key={groupTitle}
                  className={`overflow-hidden rounded-xl border-2 shadow-sm ${borderCls}`}
                >
                  <div className={`px-4 py-2.5 ${headerCls}`}>
                    <h4 className="text-sm font-bold">{groupTitle}</h4>
                  </div>

                  <div className="space-y-2 bg-white p-3">
                    {Object.entries(itemMap).map(
                      ([label, completionsForItem]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="flex-shrink-0 text-green-500">
                              ✓
                            </span>
                            <span className="truncate text-sm text-gray-800">
                              {label}
                            </span>
                          </div>

                          <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1">
                            {completionsForItem.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center gap-0.5"
                              >
                                <span
                                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-white ${getUserColorBg(
                                    c.user.id,
                                    allUserIds,
                                  )}`}
                                >
                                  {c.user.name || "Ukjent"}
                                </span>
                                {c.user.id === currentUserId && (
                                  <button
                                    onClick={() => onDeleteCompletion(c.id)}
                                    disabled={deletingId === c.id}
                                    className="ml-0.5 text-base leading-none text-gray-300 transition-colors hover:text-red-500 disabled:opacity-40"
                                    title="Slett min godkjenning"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
