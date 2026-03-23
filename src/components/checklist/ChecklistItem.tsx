// src/components/checklist/ChecklistItem.tsx
import { Item, Completion, getUserColor } from "./checklistTypes";

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
  item, groupId, currentUserId, allUserIds, checkStyle,
  isChecked, isAdmin, editingItemId, editingItemLabel,
  onToggle, onEditStart, onEditChange, onEditSave, onEditCancel, onDelete,
}: Props) {
  const isDone = !!item.completions.find((c) => c.userId === currentUserId);
  const isEditing = editingItemId === item.id;

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded-lg transition-colors
        ${isDone ? "cursor-default" : "cursor-pointer hover:bg-white/70"}
        ${isChecked && !isDone ? "bg-white shadow-sm" : ""}`}
    >
      <input
        type="checkbox"
        checked={isDone || isChecked}
        disabled={isDone}
        onChange={() => onToggle(item.id, isDone)}
        className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 ${checkStyle}`}
      />
      <div className="flex-1 min-w-0">
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
              className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button onClick={() => onEditSave(item.id, groupId)} className="text-green-600 hover:text-green-700 text-sm">✓</button>
            <button onClick={onEditCancel} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 group">
            <span className="text-sm text-gray-800 font-medium">{item.label}</span>
            {isAdmin && (
              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onEditStart(item.id, item.label)}
                  className="text-gray-400 hover:text-blue-600 text-xs p-0.5"
                  title="Rediger"
                >✏️</button>
                <button
                  onClick={() => onDelete(item.id, groupId)}
                  className="text-gray-400 hover:text-red-500 text-xs p-0.5"
                  title="Slett"
                >🗑️</button>
              </div>
            )}
          </div>
        )}
        {item.completions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.completions.map((c) => (
              <span
                key={c.userId}
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getUserColor(c.userId, allUserIds)}`}
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
