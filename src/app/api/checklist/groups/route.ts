// src/app/api/checklist/groups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const { title, color } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Tittel er påkrevd" }, { status: 400 });
  }

  const lastGroup = await prisma.checklistGroup.findFirst({
    orderBy: { order: "desc" },
  });

  const group = await prisma.checklistGroup.create({
    data: {
      title: title.trim(),
      color: color || "blue",
      order: (lastGroup?.order ?? -1) + 1,
    },
    include: { items: true },
  });

  return NextResponse.json({ group }, { status: 201 });
}
