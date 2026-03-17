// src/app/api/checklist/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: approve/submit checked items
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const today = new Date().toISOString().split("T")[0];
  const { itemIds } = await req.json(); // array of item IDs to mark complete

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return NextResponse.json(
      { error: "Ingen oppgaver valgt" },
      { status: 400 },
    );
  }

  // Only create completions that don't already exist for this user today
  const existing = await prisma.checklistCompletion.findMany({
    where: { userId, date: today, itemId: { in: itemIds } },
    select: { itemId: true },
  });

  const existingIds = new Set(
    existing.map((e: { itemId: string }) => e.itemId),
  );
  const newIds = itemIds.filter((id: string) => !existingIds.has(id));

  if (newIds.length > 0) {
    await prisma.checklistCompletion.createMany({
      data: newIds.map((itemId: string) => ({
        itemId,
        userId,
        date: today,
        completedAt: new Date(),
      })),
    });
  }

  return NextResponse.json({
    created: newIds.length,
    skipped: existingIds.size,
  });
}
