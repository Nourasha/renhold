"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/serverSession";

export async function deleteCompletionAction(completionId: string) {
  const user = await requireSession();

  const completion = await prisma.checklistCompletion.findUnique({
    where: { id: completionId },
  });

  if (!completion) return { ok: false, error: "Ikke funnet" };
  if (completion.userId !== user.id) return { ok: false, error: "Ikke autorisert" };

  await prisma.checklistCompletion.delete({
    where: { id: completionId },
  });

  revalidatePath("/dashboard/ferdige");

  return { ok: true };
}
