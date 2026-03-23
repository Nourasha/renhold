// src/components/checklist/ChecklistGroup.tsx
import { Group, groupStyles } from "./checklistTypes";
import { ChecklistItem } from "./ChecklistItem";

interface Props {
  group: Group;
  currentUserId: string;
  allUserIds: string[];
  checked: Set<string>;
  isAdmin?: boolean;
  editingGroupId: string | null;
  editingGroupTitle: string;
  editingItemId: string | null;
  editingItemLabel: string;
  addingItemToGroup: string | null;
  newItemLabel: string;
  onToggleItem: (itemId: string, isDone: boolean) => void;
  onGroupEditStart: (groupId: string, title: string) => void;
  onGroupEditChange: (title: string) => void;
  onGroupEditSave: (groupId: string) => void;
  onGroupEditCancel: () => void;
  onGroupDelete: (groupId: string) => void;
  onItemEditStart: (itemId: string, label: string) => void;
  onItemEditChange: (label: string) => void;
  onItemEditSave: (itemId: string, groupId: string) => void;
  onItemEditCancel: () => void;
  onItemDelete: (itemId: string, groupId: string) => void;
  onAddItemStart: (groupId: string) => void;
  onAddItemLabelChange: (label: string) => void;
  onAddItem: (groupId: string) => void;
  onAddItemCancel: () => void;
}

export function ChecklistGroup({
  group, currentUserId, allUserIds, checked, isAdmin,
  editingGroupId, editingGroupTitle, editingItemId, editingItemLabel,
  addingItemToGroup, newItemLabel,
  onToggleItem, onGroupEditStart, onGroupEditChange, onGroupEditSave,
  onGroupEditCancel, onGroupDelete, onItemEditStart, onItemEditChange,
  onItemEditSave, onItemEditCancel, onItemDelete,
  onAddItemStart, onAddItemLabelChange, onAddItem, onAddItemCancel,
}: Props) {
  const style = groupStyles[group.color] || groupStyles.blue;
  const isEditingGroup = editingGroupId === group.id;
  const isAddingItem = addingItemToGroup === group.id;

  return (
    <div className={`rounded-xl border-2 overflow-hidden shadow-sm ${style.card}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${style.header}`}>
        {isEditingGroup ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editingGroupTitle}
              onChange={(e) => onGroupEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onGroupEditSave(group.id);
                if (e.key === "Escape") onGroupEditCancel();
              }}
              className="flex-1 px-2 py-1 text-sm text-gray-900 rounded border border-white/50 focus:outline-none"
              autoFocus
            />
            <button onClick={() => onGroupEditSave(group.id)} className="text-white text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">✓</button>
            <button onClick={onGroupEditCancel} className="text-white/70 hover:text-white text-xs">✕</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-base">{group.title}</h3>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onGroupEditStart(group.id, group.title)}
                  className="text-white/70 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/20"
                  title="Rediger kategori"
                >✏️</button>
                <button
                  onClick={() => onGroupDelete(group.id)}
                  className="text-white/70 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/20"
                  title="Slett kategori"
                >🗑️</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Items */}
      <div className="p-3 space-y-1.5">
        {group.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            groupId={group.id}
            currentUserId={currentUserId}
            allUserIds={allUserIds}
            checkStyle={style.check}
            isChecked={checked.has(item.id)}
            isAdmin={isAdmin}
            editingItemId={editingItemId}
            editingItemLabel={editingItemLabel}
            onToggle={onToggleItem}
            onEditStart={onItemEditStart}
            onEditChange={onItemEditChange}
            onEditSave={onItemEditSave}
            onEditCancel={onItemEditCancel}
            onDelete={onItemDelete}
          />
        ))}

        {/* Add item inline */}
        {isAdmin && (
          isAddingItem ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newItemLabel}
                onChange={(e) => onAddItemLabelChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onAddItem(group.id);
                  if (e.key === "Escape") onAddItemCancel();
                }}
                placeholder="Navn på oppgave..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button onClick={() => onAddItem(group.id)} className="text-green-600 hover:text-green-700 text-sm font-bold">✓</button>
              <button onClick={onAddItemCancel} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
          ) : (
            <button
              onClick={() => onAddItemStart(group.id)}
              className="w-full text-left text-xs text-gray-400 hover:text-gray-600 pt-1 pl-1 hover:underline"
            >
              + Legg til oppgave
            </button>
          )
        )}
      </div>
    </div>
  );
}
