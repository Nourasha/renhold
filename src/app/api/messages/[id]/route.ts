// src/app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mark message as read
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const message = await prisma.message.findUnique({ where: { id: params.id } });
  if (!message) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });

  const readBy: string[] = JSON.parse(message.readBy || "[]");
  if (!readBy.includes(userId)) {
    readBy.push(userId);
    await prisma.message.update({
      where: { id: params.id },
      data: { readBy: JSON.stringify(readBy) },
    });
  }

  return NextResponse.json({ success: true });
}

// Delete own message
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const message = await prisma.message.findUnique({ where: { id: params.id } });
  if (!message) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });

  if (message.senderId !== userId && role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  await prisma.message.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
