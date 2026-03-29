import type { Item } from "@/types";
import { getUserColorTint } from "@/lib/utils";

interface Props {
  item: Item;
  groupId: string;
  currentUserId: string;
  allUserIds: string[];
  checkStyle: string;
  isChecked: boolean;
  isAdmin?: boolean;
  editingItemId: string | null;
  editingItemLabel: string;
  onToggle: (itemId: string, isDone: boolean) => void;
  onEditStart: (itemId: string, label: string) => void;
  onEditChange: (label: string) => void;
  onEditSave: (itemId: string, groupId: string) => void;
  onEditCancel: () => void;
  onDelete: (itemId: string, groupId: string) => void;
}

export function ChecklistItem({
  item,
  groupId,
  currentUserId,
  allUserIds,
  checkStyle,
  isChecked,
  isAdmin,
  editingItemId,
  editingItemLabel,
  onToggle,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: Props) {
  const isDone = !!item.completions.find((c) => c.userId === currentUserId);
  const isEditing = editingItemId === item.id;

  return (
    <div
      className={`flex items-start gap-2 rounded-lg p-2 transition-colors
        ${isDone ? "cursor-default" : "cursor-pointer hover:bg-white/70"}
        ${isChecked && !isDone ? "bg-white shadow-sm" : ""}`}
    >
      <input
        type="checkbox"
        checked={isDone || isChecked}
        disabled={isDone}
        onChange={() => onToggle(item.id, isDone)}
        className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded ${checkStyle}`}
        aria-label={`Toggle completion for ${item.label}`}
      />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editingItemLabel}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditSave(item.id, groupId);
                if (e.key === "Escape") onEditCancel();
              }}
              aria-label="Rediger oppgavenavn"
              className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => onEditSave(item.id, groupId)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              ✓
            </button>
            <button
              onClick={onEditCancel}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="group flex items-center justify-between gap-1">
            <span className="text-sm font-medium text-gray-800">
              {item.label}
            </span>

            {isAdmin && (
              <div className="flex flex-shrink-0 gap-0.5">
                <button
                  onClick={() => onEditStart(item.id, item.label)}
                  className="p-0.5 text-xs text-gray-400 hover:text-blue-600"
                  title="Rediger"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(item.id, groupId)}
                  className="p-0.5 text-xs text-gray-400 hover:text-red-500"
                  title="Slett"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        )}

        {item.completions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.completions.map((c) => (
              <span
                key={`${item.id}-${c.userId}`}
                className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getUserColorTint(
                  c.userId,
                  allUserIds,
                )}`}
              >
                {c.user.name || "Ukjent"}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
