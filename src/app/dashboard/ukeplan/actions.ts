"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Ikke autorisert");
  return session;
}

export async function addWeekPlan(data: {
  title: string;
  description?: string;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
}) {
  await requireAuth();

  const plan = await prisma.weekPlan.create({
    data: {
      title: data.title,
      description: data.description,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
    },
  });

  revalidatePath("/dashboard/ukeplan");
  return plan;
}

export async function deleteWeekPlan(id: string) {
  await requireAuth();
  await prisma.weekPlan.delete({ where: { id } });
  revalidatePath("/dashboard/ukeplan");
}
