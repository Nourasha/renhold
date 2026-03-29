"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendPushToAll } from "@/lib/pushNotification";
import { requireSession } from "@/lib/serverSession";

export async function createDeviationAction(input: {
  title: string;
  description: string;
  severity: string;
}) {
  const user = await requireSession();

  const title = input.title.trim();
  const description = input.description.trim();
  const severity = input.severity?.trim() || "low";

  if (!title || !description) {
    return { ok: false, error: "Tittel og beskrivelse er påkrevd" };
  }

  const deviation = await prisma.deviation.create({
    data: {
      title,
      description,
      severity,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const severityLabel: Record<string, string> = {
    low: "Lav",
    medium: "Middels",
    high: "Høy",
    critical: "Kritisk",
  };

  await sendPushToAll(
    {
      title: `⚠️ Nytt avvik: ${title}`,
      body: `${user.name || "En bruker"} registrerte et avvik (${severityLabel[severity] || "Lav"})`,
      url: "/dashboard/avvik",
    },
    user.id,
  );

  revalidatePath("/dashboard/avvik");

  return { ok: true, deviation };
}

export async function updateDeviationStatusAction(id: string, status: string) {
  const user = await requireSession();

  const allowedStatuses = ["open", "in-progress", "resolved"];
  if (!allowedStatuses.includes(status)) {
    return { ok: false, error: "Ugyldig status" };
  }

  const updated = await prisma.deviation.updateMany({
    where: user.role === "admin" ? { id } : { id, userId: user.id },
    data: { status },
  });

  if (updated.count === 0) {
    return { ok: false, error: "Ikke funnet eller ingen tilgang" };
  }

  revalidatePath("/dashboard/avvik");

  return { ok: true };
}

export async function deleteDeviationAction(id: string) {
  const user = await requireSession();

  const deleted = await prisma.deviation.deleteMany({
    where: user.role === "admin" ? { id } : { id, userId: user.id },
  });

  if (deleted.count === 0) {
    return { ok: false, error: "Ikke funnet eller ingen tilgang" };
  }

  revalidatePath("/dashboard/avvik");

  return { ok: true };
}
