// src/app/api/checklist/completed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const completions = await prisma.checklistCompletion.findMany({
    orderBy: { completedAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, name: true } },
      item: {
        include: {
          group: { select: { title: true, color: true } },
        },
      },
    },
  });

  return NextResponse.json({ completions });
}
