"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Group } from "@/types";
import { groupStyles } from "@/lib/utils";
import { ChecklistItem } from "./ChecklistItem";
import { useChecklistActions } from "./useChecklistActions";

interface Props {
  group: Group;
  currentUserId: string;
  allUserIds: string[];
  checked: Set<string>;
  isAdmin?: boolean;
  setGroups: Dispatch<SetStateAction<Group[]>>;
  onToggleItem: (itemId: string, isDone: boolean) => void;
}

export function ChecklistGroup({
  group, currentUserId, allUserIds, checked, isAdmin, setGroups, onToggleItem,
}: Props) {
  const actions = useChecklistActions(setGroups);
  const style = groupStyles[group.color] || groupStyles.blue;

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editingGroupTitle, setEditingGroupTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemLabel, setEditingItemLabel] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  return (
    <div className={`rounded-xl border-2 overflow-hidden shadow-sm ${style.card}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${style.header}`}>
        {isEditingGroup ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editingGroupTitle}
              onChange={(e) => setEditingGroupTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") actions.saveGroupTitle(group.id, editingGroupTitle, () => setIsEditingGroup(false));
                if (e.key === "Escape") setIsEditingGroup(false);
              }}
              aria-label="Kategorinavn"
              placeholder="Kategorinavn..."
              className="flex-1 px-2 py-1 text-sm text-gray-900 rounded border border-white/50 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => actions.saveGroupTitle(group.id, editingGroupTitle, () => setIsEditingGroup(false))}
              className="text-white text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
            >✓</button>
            <button type="button" onClick={() => setIsEditingGroup(false)} className="text-white/70 hover:text-white text-xs">✕</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-base">{group.title}</h3>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setEditingGroupTitle(group.title); setIsEditingGroup(true); }}
                  className="text-white/70 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/20"
                  title="Rediger kategori"
                >✏️</button>
                <button
                  type="button"
                  onClick={() => actions.deleteGroup(group.id)}
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
            onEditStart={(id, label) => { setEditingItemId(id); setEditingItemLabel(label); }}
            onEditChange={setEditingItemLabel}
            onEditSave={(id, gid) => actions.saveItemLabel(id, gid, editingItemLabel, () => setEditingItemId(null))}
            onEditCancel={() => setEditingItemId(null)}
            onDelete={actions.deleteItem}
          />
        ))}

        {isAdmin && (
          isAddingItem ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") actions.addItem(group.id, newItemLabel, () => { setNewItemLabel(""); setIsAddingItem(false); });
                  if (e.key === "Escape") setIsAddingItem(false);
                }}
                aria-label="Navn på oppgave"
                placeholder="Navn på oppgave..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => actions.addItem(group.id, newItemLabel, () => { setNewItemLabel(""); setIsAddingItem(false); })}
                className="text-green-600 hover:text-green-700 text-sm font-bold"
              >✓</button>
              <button type="button" onClick={() => setIsAddingItem(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setIsAddingItem(true); setNewItemLabel(""); }}
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
