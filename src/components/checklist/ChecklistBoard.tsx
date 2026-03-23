"use client";
// src/components/checklist/ChecklistBoard.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Group } from "./checklistTypes";
import { ChecklistGroup } from "./ChecklistGroup";
import { AddGroupPanel } from "./AddGroupPanel";
import { useChecklistActions } from "./useChecklistActions";

interface Props {
  initialGroups: Group[];
  currentUserId: string;
  today: string;
  isAdmin?: boolean;
}

export function ChecklistBoard({ initialGroups, currentUserId, today, isAdmin }: Props) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemLabel, setEditingItemLabel] = useState("");
  const [addingItemToGroup, setAddingItemToGroup] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("blue");

  const actions = useChecklistActions(setGroups);

  const allUserIds = Array.from(new Set(
    groups.flatMap((g) => g.items.flatMap((i) => i.completions.map((c) => c.userId)))
  ));

  function toggleItem(itemId: string, isDone: boolean) {
    if (isDone) return;
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  }

  async function approveAll() {
    const itemIds = Array.from(checked);
    if (itemIds.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/checklist/complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });
    if (res.ok) {
      setChecked(new Set());
      setSuccessMsg(`${itemIds.length} oppgave${itemIds.length !== 1 ? "r" : ""} godkjent! ✅`);
      setTimeout(() => setSuccessMsg(null), 4000);
      router.refresh();
    }
    setLoading(false);
  }

  const totalChecked = checked.size;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={approveAll}
          disabled={totalChecked === 0 || loading}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Godkjenner..." : totalChecked > 0
            ? `✓ Godkjenn ${totalChecked} oppgave${totalChecked !== 1 ? "r" : ""}`
            : "✓ Godkjenn valgte"}
        </button>
        {totalChecked > 0 && !loading && (
          <button onClick={() => setChecked(new Set())} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Fjern alle valg
          </button>
        )}
      </div>

      {successMsg && (
        <div className="px-4 py-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {groups.map((group) => (
          <ChecklistGroup
            key={group.id}
            group={group}
            currentUserId={currentUserId}
            allUserIds={allUserIds}
            checked={checked}
            isAdmin={isAdmin}
            editingGroupId={editingGroupId}
            editingGroupTitle={editingGroupTitle}
            editingItemId={editingItemId}
            editingItemLabel={editingItemLabel}
            addingItemToGroup={addingItemToGroup}
            newItemLabel={newItemLabel}
            onToggleItem={toggleItem}
            onGroupEditStart={(id, title) => { setEditingGroupId(id); setEditingGroupTitle(title); }}
            onGroupEditChange={setEditingGroupTitle}
            onGroupEditSave={(id) => actions.saveGroupTitle(id, editingGroupTitle, () => setEditingGroupId(null))}
            onGroupEditCancel={() => setEditingGroupId(null)}
            onGroupDelete={actions.deleteGroup}
            onItemEditStart={(id, label) => { setEditingItemId(id); setEditingItemLabel(label); }}
            onItemEditChange={setEditingItemLabel}
            onItemEditSave={(id, gid) => actions.saveItemLabel(id, gid, editingItemLabel, () => setEditingItemId(null))}
            onItemEditCancel={() => setEditingItemId(null)}
            onItemDelete={actions.deleteItem}
            onAddItemStart={(id) => { setAddingItemToGroup(id); setNewItemLabel(""); }}
            onAddItemLabelChange={setNewItemLabel}
            onAddItem={(gid) => actions.addItem(gid, newItemLabel, () => { setNewItemLabel(""); setAddingItemToGroup(null); })}
            onAddItemCancel={() => setAddingItemToGroup(null)}
          />
        ))}
        {isAdmin && (
          <AddGroupPanel
            show={showNewGroup}
            title={newGroupTitle}
            color={newGroupColor}
            onToggle={() => setShowNewGroup((v) => !v)}
            onTitleChange={setNewGroupTitle}
            onColorChange={setNewGroupColor}
            onAdd={() => actions.addGroup(newGroupTitle, newGroupColor, () => {
              setNewGroupTitle(""); setNewGroupColor("blue"); setShowNewGroup(false);
            })}
          />
        )}
      </div>
    </div>
  );
}
