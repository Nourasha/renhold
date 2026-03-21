// src/app/api/checklist/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const { label } = await req.json();
  const item = await prisma.checklistItem.update({
    where: { id: params.id },
    data: { label: label.trim() },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  await prisma.checklistItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
