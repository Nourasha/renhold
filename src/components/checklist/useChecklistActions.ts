"use client";
// src/components/checklist/useChecklistActions.ts
import { Dispatch, SetStateAction } from "react";
import { Group } from "./checklistTypes";

type SetGroups = Dispatch<SetStateAction<Group[]>>;

export function useChecklistActions(setGroups: SetGroups) {
  async function saveGroupTitle(groupId: string, title: string, onDone: () => void) {
    if (!title.trim()) return;
    const res = await fetch(`/api/checklist/groups/${groupId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, title: title.trim() } : g));
      onDone();
    }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm("Slett denne kategorien og alle oppgavene i den?")) return;
    const res = await fetch(`/api/checklist/groups/${groupId}`, { method: "DELETE" });
    if (res.ok) setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }

  async function saveItemLabel(itemId: string, groupId: string, label: string, onDone: () => void) {
    if (!label.trim()) return;
    const res = await fetch(`/api/checklist/items/${itemId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      setGroups((prev) => prev.map((g) => g.id === groupId
        ? { ...g, items: g.items.map((i) => i.id === itemId ? { ...i, label: label.trim() } : i) } : g
      ));
      onDone();
    }
  }

  async function deleteItem(itemId: string, groupId: string) {
    if (!confirm("Slett denne oppgaven?")) return;
    const res = await fetch(`/api/checklist/items/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setGroups((prev) => prev.map((g) => g.id === groupId
        ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g
      ));
    }
  }

  async function addItem(groupId: string, label: string, onDone: () => void) {
    if (!label.trim()) return;
    const res = await fetch(`/api/checklist/groups/${groupId}/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups((prev) => prev.map((g) => g.id === groupId
        ? { ...g, items: [...g.items, { ...data.item, completions: [] }] } : g
      ));
      onDone();
    }
  }

  async function addGroup(title: string, color: string, onDone: () => void) {
    if (!title.trim()) return;
    const res = await fetch("/api/checklist/groups", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, color }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups((prev) => [...prev, { ...data.group, items: [] }]);
      onDone();
    }
  }

  return { saveGroupTitle, deleteGroup, saveItemLabel, deleteItem, addItem, addGroup };
}
