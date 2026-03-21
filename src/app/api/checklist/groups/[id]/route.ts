// src/app/api/checklist/groups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const { title, color } = await req.json();
  const group = await prisma.checklistGroup.update({
    where: { id: params.id },
    data: { ...(title && { title: title.trim() }), ...(color && { color }) },
  });

  return NextResponse.json({ group });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  await prisma.checklistGroup.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
