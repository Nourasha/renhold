// src/app/api/checklist/groups/[id]/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const { label } = await req.json();
  if (!label?.trim()) {
    return NextResponse.json({ error: "Navn er påkrevd" }, { status: 400 });
  }

  const lastItem = await prisma.checklistItem.findFirst({
    where: { groupId: params.id },
    orderBy: { order: "desc" },
  });

  const item = await prisma.checklistItem.create({
    data: {
      label: label.trim(),
      groupId: params.id,
      order: (lastItem?.order ?? -1) + 1,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
