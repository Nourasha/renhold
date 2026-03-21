"use client";
// src/components/ChecklistBoard.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Completion {
  userId: string;
  user: { id: string; name: string | null };
}

interface Item {
  id: string;
  label: string;
  order: number;
  completions: Completion[];
}

interface Group {
  id: string;
  title: string;
  color: string;
  order: number;
  items: Item[];
}

interface Props {
  initialGroups: Group[];
  currentUserId: string;
  today: string;
  isAdmin?: boolean;
}

const COLORS = ["blue", "green", "purple", "orange", "red", "yellow"];

const groupStyles: Record<
  string,
  { card: string; header: string; check: string }
> = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    header: "bg-blue-600 text-white",
    check: "accent-blue-600",
  },
  green: {
    card: "bg-green-50 border-green-200",
    header: "bg-green-600 text-white",
    check: "accent-green-600",
  },
  purple: {
    card: "bg-purple-50 border-purple-200",
    header: "bg-purple-600 text-white",
    check: "accent-purple-600",
  },
  orange: {
    card: "bg-orange-50 border-orange-200",
    header: "bg-orange-500 text-white",
    check: "accent-orange-500",
  },
  red: {
    card: "bg-red-50 border-red-200",
    header: "bg-red-600 text-white",
    check: "accent-red-600",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    header: "bg-yellow-500 text-white",
    check: "accent-yellow-500",
  },
};

const userColors = [
  "bg-indigo-100 text-indigo-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
  "bg-amber-100 text-amber-800",
  "bg-cyan-100 text-cyan-800",
  "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",
  "bg-violet-100 text-violet-800",
];

function getUserColor(userId: string, allUserIds: string[]) {
  const idx = allUserIds.indexOf(userId);
  return userColors[idx % userColors.length] || "bg-gray-100 text-gray-700";
}

export function ChecklistBoard({
  initialGroups,
  currentUserId,
  today,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin edit state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemLabel, setEditingItemLabel] = useState("");
  const [addingItemToGroup, setAddingItemToGroup] = useState<string | null>(
    null,
  );
  const [newItemLabel, setNewItemLabel] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("blue");

  const allUserIds = Array.from(
    new Set(
      groups.flatMap((g) =>
        g.items.flatMap((i) => i.completions.map((c) => c.userId)),
      ),
    ),
  );

  function toggleItem(itemId: string, isDone: boolean) {
    if (isDone) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function approveAll() {
    const itemIds = Array.from(checked);
    if (itemIds.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/checklist/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });
    if (res.ok) {
      setChecked(new Set());
      setSuccessMsg(
        `${itemIds.length} oppgave${itemIds.length !== 1 ? "r" : ""} godkjent! ✅`,
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      router.refresh();
    }
    setLoading(false);
  }

  // ── Admin functions ──

  async function saveGroupTitle(groupId: string) {
    if (!editingGroupTitle.trim()) return;
    const res = await fetch(`/api/checklist/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingGroupTitle }),
    });
    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, title: editingGroupTitle.trim() } : g,
        ),
      );
      setEditingGroupId(null);
    }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm("Slett denne kategorien og alle oppgavene i den?")) return;
    const res = await fetch(`/api/checklist/groups/${groupId}`, {
      method: "DELETE",
    });
    if (res.ok) setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }

  async function saveItemLabel(itemId: string, groupId: string) {
    if (!editingItemLabel.trim()) return;
    const res = await fetch(`/api/checklist/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editingItemLabel }),
    });
    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                items: g.items.map((i) =>
                  i.id === itemId
                    ? { ...i, label: editingItemLabel.trim() }
                    : i,
                ),
              }
            : g,
        ),
      );
      setEditingItemId(null);
    }
  }

  async function deleteItem(itemId: string, groupId: string) {
    if (!confirm("Slett denne oppgaven?")) return;
    const res = await fetch(`/api/checklist/items/${itemId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
            : g,
        ),
      );
    }
  }

  async function addItem(groupId: string) {
    if (!newItemLabel.trim()) return;
    const res = await fetch(`/api/checklist/groups/${groupId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newItemLabel }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, items: [...g.items, { ...data.item, completions: [] }] }
            : g,
        ),
      );
      setNewItemLabel("");
      setAddingItemToGroup(null);
    }
  }

  async function addGroup() {
    if (!newGroupTitle.trim()) return;
    const res = await fetch("/api/checklist/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGroupTitle, color: newGroupColor }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups((prev) => [...prev, { ...data.group, items: [] }]);
      setNewGroupTitle("");
      setNewGroupColor("blue");
      setShowNewGroup(false);
    }
  }

  const totalChecked = checked.size;

  return (
    <div className="space-y-5">
      {/* Approve button */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={approveAll}
          disabled={totalChecked === 0 || loading}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading
            ? "Godkjenner..."
            : totalChecked > 0
              ? `✓ Godkjenn ${totalChecked} oppgave${totalChecked !== 1 ? "r" : ""}`
              : "✓ Godkjenn valgte"}
        </button>
        {totalChecked > 0 && !loading && (
          <button
            onClick={() => setChecked(new Set())}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Fjern alle valg
          </button>
        )}
      </div>

      {successMsg && (
        <div className="px-4 py-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Checklist cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {groups.map((group) => {
          const style = groupStyles[group.color] || groupStyles.blue;
          const isEditingGroup = editingGroupId === group.id;

          return (
            <div
              key={group.id}
              className={`rounded-xl border-2 overflow-hidden shadow-sm ${style.card}`}
            >
              {/* Card header */}
              <div
                className={`px-4 py-3 flex items-center justify-between ${style.header}`}
              >
                {isEditingGroup ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingGroupTitle}
                      onChange={(e) => setEditingGroupTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveGroupTitle(group.id);
                        if (e.key === "Escape") setEditingGroupId(null);
                      }}
                      className="flex-1 px-2 py-1 text-sm text-gray-900 rounded border border-white/50 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveGroupTitle(group.id)}
                      className="text-white text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingGroupId(null)}
                      className="text-white/70 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-base">{group.title}</h3>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGroupId(group.id);
                            setEditingGroupTitle(group.title);
                          }}
                          className="text-white/70 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/20"
                          title="Rediger kategori"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="text-white/70 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/20"
                          title="Slett kategori"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Items */}
              <div className="p-3 space-y-1.5">
                {group.items.map((item) => {
                  const myCompletion = item.completions.find(
                    (c) => c.userId === currentUserId,
                  );
                  const isDone = !!myCompletion;
                  const isChecked = checked.has(item.id);
                  const isEditingItem = editingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${isDone ? "cursor-default" : "cursor-pointer hover:bg-white/70"} ${isChecked && !isDone ? "bg-white shadow-sm" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone || isChecked}
                        disabled={isDone}
                        onChange={() => toggleItem(item.id, isDone)}
                        className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 ${style.check}`}
                      />

                      <div className="flex-1 min-w-0">
                        {isEditingItem ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingItemLabel}
                              onChange={(e) =>
                                setEditingItemLabel(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  saveItemLabel(item.id, group.id);
                                if (e.key === "Escape") setEditingItemId(null);
                              }}
                              className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => saveItemLabel(item.id, group.id)}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="text-gray-400 hover:text-gray-600 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1 group">
                            <span className="text-sm text-gray-800 font-medium">
                              {item.label}
                            </span>
                            {isAdmin && (
                              <div className="flex gap-0.5 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditingItemLabel(item.label);
                                  }}
                                  className="text-gray-400 hover:text-blue-600 text-xs p-0.5"
                                  title="Rediger"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id, group.id)}
                                  className="text-gray-400 hover:text-red-500 text-xs p-0.5"
                                  title="Slett"
                                >
                                  🗑️
                                </button>
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
                })}

                {/* Add item */}
                {isAdmin &&
                  (addingItemToGroup === group.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addItem(group.id);
                          if (e.key === "Escape") setAddingItemToGroup(null);
                        }}
                        placeholder="Navn på oppgave..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => addItem(group.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-bold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setAddingItemToGroup(null)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingItemToGroup(group.id);
                        setNewItemLabel("");
                      }}
                      className="w-full text-left text-xs text-gray-400 hover:text-gray-600 pt-1 pl-1 hover:underline"
                    >
                      + Legg til oppgave
                    </button>
                  ))}
              </div>
            </div>
          );
        })}

        {/* Add new group card */}
        {isAdmin &&
          (showNewGroup ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 text-sm">
                Ny kategori
              </h3>
              <input
                type="text"
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addGroup();
                  if (e.key === "Escape") setShowNewGroup(false);
                }}
                placeholder="Navn på kategori..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-1 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewGroupColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${newGroupColor === c ? "border-gray-800 scale-110" : "border-transparent"} ${groupStyles[c].header.split(" ")[0]}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addGroup}
                  disabled={!newGroupTitle.trim()}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Legg til
                </button>
                <button
                  onClick={() => setShowNewGroup(false)}
                  className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGroup(true)}
              className="rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            >
              <span className="text-3xl">+</span>
              <span className="text-sm font-medium">Ny kategori</span>
            </button>
          ))}
      </div>
    </div>
  );
}
