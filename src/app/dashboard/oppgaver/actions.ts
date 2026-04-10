"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/serverSession";
import { getShiftDate } from "@/lib/utils";

export async function completeChecklistItemsAction(itemIds: string[]) {
  const user = await requireSession();

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return { ok: false, error: "Ingen oppgaver valgt" };
  }

  const today = getShiftDate();

  await prisma.$transaction(
    itemIds.map((itemId) =>
      prisma.checklistCompletion.upsert({
        where: {
          itemId_userId_date: {
            itemId,
            userId: user.id,
            date: today,
          },
        },
        update: {},
        create: {
          itemId,
          userId: user.id,
          date: today,
        },
      }),
    ),
  );

  revalidatePath("/dashboard/oppgaver");
  revalidatePath("/dashboard/ferdige");

  return { ok: true };
}

export async function addChecklistGroupAction(title: string, color: string) {
  await requireAdmin();

  const cleanTitle = title.trim();
  const cleanColor = color.trim() || "blue";

  if (!cleanTitle) {
    return { ok: false, error: "Tittel mangler" };
  }

  const lastGroup = await prisma.checklistGroup.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const group = await prisma.checklistGroup.create({
    data: {
      title: cleanTitle,
      color: cleanColor,
      order: (lastGroup?.order ?? -1) + 1,
    },
  });

  revalidatePath("/dashboard/oppgaver");

  return { ok: true, group };
}

export async function updateChecklistGroupTitleAction(
  groupId: string,
  title: string,
) {
  await requireAdmin();

  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return { ok: false, error: "Tittel mangler" };
  }

  await prisma.checklistGroup.update({
    where: { id: groupId },
    data: { title: cleanTitle },
  });

  revalidatePath("/dashboard/oppgaver");

  return { ok: true };
}

export async function deleteChecklistGroupAction(groupId: string) {
  await requireAdmin();

  await prisma.checklistGroup.delete({
    where: { id: groupId },
  });

  revalidatePath("/dashboard/oppgaver");

  return { ok: true };
}

export async function addChecklistItemAction(groupId: string, label: string) {
  await requireAdmin();

  const cleanLabel = label.trim();

  if (!cleanLabel) {
    return { ok: false, error: "Oppgavenavn mangler" };
  }

  const lastItem = await prisma.checklistItem.findFirst({
    where: { groupId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const item = await prisma.checklistItem.create({
    data: {
      groupId,
      label: cleanLabel,
      order: (lastItem?.order ?? -1) + 1,
    },
  });

  revalidatePath("/dashboard/oppgaver");

  return {
    ok: true,
    item: {
      ...item,
      completions: [],
    },
  };
}

export async function updateChecklistItemLabelAction(
  itemId: string,
  label: string,
) {
  await requireAdmin();

  const cleanLabel = label.trim();

  if (!cleanLabel) {
    return { ok: false, error: "Oppgavenavn mangler" };
  }

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { label: cleanLabel },
  });

  revalidatePath("/dashboard/oppgaver");

  return { ok: true };
}

export async function deleteChecklistItemAction(itemId: string) {
  await requireAdmin();

  await prisma.checklistItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/dashboard/oppgaver");

  return { ok: true };
}
