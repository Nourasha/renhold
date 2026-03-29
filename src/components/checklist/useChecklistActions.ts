"use client";

import { Dispatch, SetStateAction } from "react";

import { Group } from "@/types";
import {
  addChecklistGroupAction,
  addChecklistItemAction,
  deleteChecklistGroupAction,
  deleteChecklistItemAction,
  updateChecklistGroupTitleAction,
  updateChecklistItemLabelAction,
} from "@/app/dashboard/oppgaver/actions";

type SetGroups = Dispatch<SetStateAction<Group[]>>;

export function useChecklistActions(setGroups: SetGroups) {
  async function saveGroupTitle(
    groupId: string,
    title: string,
    onDone: () => void,
  ) {
    if (!title.trim()) return;

    const res = await updateChecklistGroupTitleAction(groupId, title);

    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: title.trim() } : g)),
      );
      onDone();
    }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm("Slett denne kategorien og alle oppgavene i den?")) return;

    const res = await deleteChecklistGroupAction(groupId);

    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    }
  }

  async function saveItemLabel(
    itemId: string,
    groupId: string,
    label: string,
    onDone: () => void,
  ) {
    if (!label.trim()) return;

    const res = await updateChecklistItemLabelAction(itemId, label);

    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                items: g.items.map((i) =>
                  i.id === itemId ? { ...i, label: label.trim() } : i,
                ),
              }
            : g,
        ),
      );
      onDone();
    }
  }

  async function deleteItem(itemId: string, groupId: string) {
    if (!confirm("Slett denne oppgaven?")) return;

    const res = await deleteChecklistItemAction(itemId);

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

  async function addItem(groupId: string, label: string, onDone: () => void) {
    if (!label.trim()) return;

    const res = await addChecklistItemAction(groupId, label);

    if (res.ok && res.item) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, items: [...g.items, res.item] } : g,
        ),
      );
      onDone();
    }
  }

  async function addGroup(title: string, color: string, onDone: () => void) {
    if (!title.trim()) return;

    const res = await addChecklistGroupAction(title, color);

    if (res.ok && res.group) {
      setGroups((prev) => [...prev, { ...res.group, items: [] }]);
      onDone();
    }
  }

  return {
    saveGroupTitle,
    deleteGroup,
    saveItemLabel,
    deleteItem,
    addItem,
    addGroup,
  };
}
