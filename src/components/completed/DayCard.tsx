// src/components/completed/DayCard.tsx
import {
  Completion,
  DailyNote,
  DAY_COLORS,
  groupHeaderColors,
  groupBorderColors,
  formatDate,
  getWeekNumber,
  getUserColorClass,
} from "./types";

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
  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  const dayColor = DAY_COLORS[dayOfWeek];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Day header */}
      <div
        className={`flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-b border-gray-100 ${
          isToday ? "bg-blue-100" : dayColor.bg
        }`}
      >
        <h3
          className={`font-bold flex items-center gap-2 flex-wrap ${
            isToday ? "text-blue-800" : dayColor.text
          }`}
        >
          <span className="text-lg">📅</span>
          {formatDate(date)}
          <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full font-medium">
            Uke {weekNum}
          </span>
          {isToday && (
            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full font-medium">
              I dag
            </span>
          )}
        </h3>

        {!isNoteOpen && (
          <button
            onClick={() => onToggleNote(date)}
            className="text-sm px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <span>📝</span>
            {myNote ? "Rediger notat" : "Legg til notat"}
          </button>
        )}
      </div>

      {/* Day content */}
      <div className="p-4 space-y-3">

        {/* Note editor */}
        {isNoteOpen && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-yellow-800">
              📝 Ditt notat for {formatDate(date)}
            </p>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(date, e.target.value)}
              rows={3}
              placeholder="Skriv hva du har gjort i dag, spesifikasjoner, avvik..."
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none bg-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveNote(date)}
                disabled={!draft.trim() || savingNote === date}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {savingNote === date ? "Lagrer..." : "Lagre notat"}
              </button>
              <button
                onClick={() => onCloseNote(date)}
                className="px-4 py-2 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {/* Existing notes */}
        {dayNotes.length > 0 && (
          <div className="space-y-2">
            {dayNotes.map((note) => (
              <div
                key={note.id}
                className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 flex gap-3"
              >
                <span className="text-yellow-400 flex-shrink-0">📝</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getUserColorClass(
                        note.user.id,
                        allUserIds
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
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checklist completions */}
        {Object.keys(completionsByGroup).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(completionsByGroup).map(([groupTitle, itemMap]) => {
              const firstCompletion = Object.values(itemMap)[0]?.[0];
              const color = firstCompletion?.item.group.color || "blue";
              const headerCls = groupHeaderColors[color] || groupHeaderColors.blue;
              const borderCls = groupBorderColors[color] || groupBorderColors.blue;

              return (
                <div
                  key={groupTitle}
                  className={`rounded-xl border-2 overflow-hidden shadow-sm ${borderCls}`}
                >
                  <div className={`px-4 py-2.5 ${headerCls}`}>
                    <h4 className="font-bold text-sm">{groupTitle}</h4>
                  </div>
                  <div className="bg-white p-3 space-y-2">
                    {Object.entries(itemMap).map(([label, completionsForItem]) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-green-500 flex-shrink-0">✓</span>
                          <span className="text-sm text-gray-800 truncate">{label}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap justify-end flex-shrink-0">
                          {completionsForItem.map((c) => (
                            <div key={c.id} className="flex items-center gap-0.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${getUserColorClass(
                                  c.user.id,
                                  allUserIds
                                )}`}
                              >
                                {c.user.name || "Ukjent"}
                              </span>
                              {c.user.id === currentUserId && (
                                <button
                                  onClick={() => onDeleteCompletion(c.id)}
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
                    ))}
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
