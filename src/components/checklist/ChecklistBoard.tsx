"use client";

import { useEffect, useState, useTransition } from "react";
import type { Group } from "@/types";
import { ChecklistGroup } from "./ChecklistGroup";
import { AddGroupPanel } from "./AddGroupPanel";
import { completeChecklistItemsAction } from "@/app/dashboard/oppgaver/actions";

interface Props {
  initialGroups: Group[];
  currentUserId: string;
  currentUserName: string;
  today?: string;
  isAdmin?: boolean;
}

export function ChecklistBoard({
  initialGroups,
  currentUserId,
  currentUserName,
  isAdmin,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState(initialGroups);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  const allUserIds = Array.from(
    new Set([
      currentUserId,
      ...groups.flatMap((g) =>
        g.items.flatMap((i) => i.completions.map((c) => c.userId)),
      ),
    ]),
  );

  function toggleItem(itemId: string, isDone: boolean) {
    if (isDone) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  async function approveAll() {
    const itemIds = Array.from(checked);
    if (itemIds.length === 0) return;

    setErrorMsg(null);
    const previousGroups = groups;

    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          if (!itemIds.includes(item.id)) return item;
          const alreadyCompleted = item.completions.some((c) => c.userId === currentUserId);
          if (alreadyCompleted) return item;
          return {
            ...item,
            completions: [
              ...item.completions,
              { userId: currentUserId, user: { id: currentUserId, name: currentUserName } },
            ],
          };
        }),
      })),
    );

    setChecked(new Set());
    setSuccessMsg(`${itemIds.length} oppgave${itemIds.length !== 1 ? "r" : ""} godkjent! ✅`);
    setTimeout(() => setSuccessMsg(null), 4000);

    startTransition(async () => {
      const res = await completeChecklistItemsAction(itemIds);
      if (!res.ok) {
        setGroups(previousGroups);
        setErrorMsg(res.error || "Kunne ikke godkjenne oppgavene");
      }
    });
  }

  const totalChecked = checked.size;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={approveAll}
          disabled={isPending || totalChecked === 0}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Godkjenner..."
            : totalChecked > 0
              ? `✓ Godkjenn ${totalChecked} oppgave${totalChecked !== 1 ? "r" : ""}`
              : "✓ Godkjenn valgte"}
        </button>

        {totalChecked > 0 && !isPending && (
          <button
            type="button"
            onClick={() => setChecked(new Set())}
            className="text-sm text-gray-400 underline hover:text-gray-600"
          >
            Fjern alle valg
          </button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <ChecklistGroup
            key={group.id}
            group={group}
            currentUserId={currentUserId}
            allUserIds={allUserIds}
            checked={checked}
            isAdmin={isAdmin}
            setGroups={setGroups}
            onToggleItem={toggleItem}
          />
        ))}
        {isAdmin && <AddGroupPanel setGroups={setGroups} />}
      </div>
    </div>
  );
}
