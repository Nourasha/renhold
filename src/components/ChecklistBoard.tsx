"use client";
// src/components/ChecklistBoard.tsx
import { useState, useCallback } from "react";
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
}

const groupStyles: Record<string, { card: string; header: string; check: string }> = {
  blue:   { card: "bg-blue-50 border-blue-200",    header: "bg-blue-600 text-white",    check: "accent-blue-600"   },
  green:  { card: "bg-green-50 border-green-200",  header: "bg-green-600 text-white",   check: "accent-green-600"  },
  purple: { card: "bg-purple-50 border-purple-200",header: "bg-purple-600 text-white",  check: "accent-purple-600" },
  orange: { card: "bg-orange-50 border-orange-200",header: "bg-orange-500 text-white",  check: "accent-orange-500" },
  red:    { card: "bg-red-50 border-red-200",      header: "bg-red-600 text-white",     check: "accent-red-600"    },
  yellow: { card: "bg-yellow-50 border-yellow-200",header: "bg-yellow-500 text-white",  check: "accent-yellow-500" },
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

export function ChecklistBoard({ initialGroups, currentUserId, today }: Props) {
  const router = useRouter();

  // checked = items ticked but not yet approved, keyed by itemId (global, not per group)
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Collect all unique user IDs across all groups for stable colour assignment
  const allUserIds = Array.from(
    new Set(
      initialGroups.flatMap((g) =>
        g.items.flatMap((i) => i.completions.map((c) => c.userId))
      )
    )
  );

  function toggleItem(itemId: string, isDone: boolean) {
    if (isDone) return; // already approved by this user — cannot uncheck
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
      setChecked(new Set()); // clear all ticks
      setSuccessMsg(`${itemIds.length} oppgave${itemIds.length !== 1 ? "r" : ""} godkjent! ✅`);
      setTimeout(() => setSuccessMsg(null), 4000);
      // Full server-side refresh so all users' completions are shown fresh
      router.refresh();
    }
    setLoading(false);
  }

  const totalChecked = checked.size;

  return (
    <div className="space-y-5">
      {/* ── Single global approve button ── */}
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

      {/* ── Checklist cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {initialGroups.map((group) => {
          const style = groupStyles[group.color] || groupStyles.blue;

          return (
            <div
              key={group.id}
              className={`rounded-xl border-2 overflow-hidden shadow-sm ${style.card}`}
            >
              {/* Card header */}
              <div className={`px-4 py-3 flex items-center justify-between ${style.header}`}>
                <h3 className="font-bold text-base">{group.title}</h3>
                <span className="text-sm opacity-80">{group.items.length} oppg.</span>
              </div>

              {/* Items */}
              <div className="p-3 space-y-1.5">
                {group.items.map((item) => {
                  const myCompletion = item.completions.find(
                    (c) => c.userId === currentUserId
                  );
                  const isDone = !!myCompletion;
                  const isChecked = checked.has(item.id);

                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                        isDone
                          ? "cursor-default"           // done → no hover effect, no style change
                          : "cursor-pointer hover:bg-white/70"
                      } ${isChecked && !isDone ? "bg-white shadow-sm" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone || isChecked}
                        disabled={isDone}
                        onChange={() => toggleItem(item.id, isDone)}
                        className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 ${style.check}`}
                      />
                      <div className="flex-1 min-w-0">
                        {/* Label — never strikethrough, never greyed */}
                        <span className="text-sm text-gray-800 font-medium">
                          {item.label}
                        </span>

                        {/* Who completed it today */}
                        {item.completions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.completions.map((c) => (
                              <span
                                key={c.userId}
                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getUserColor(
                                  c.userId,
                                  allUserIds
                                )}`}
                              >
                                {c.user.name || "Ukjent"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
