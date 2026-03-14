// src/app/api/checklist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const groups = await prisma.checklistGroup.findMany({
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          completions: {
            where: { date: today },
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  return NextResponse.json({ groups, today });
}
