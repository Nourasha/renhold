// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD, optional

  const notes = await prisma.dailyNote.findMany({
    where: {
      ...(date ? { date } : {}),
    },
    orderBy: { date: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const { content, date } = await req.json();

  if (!content?.trim() || !date) {
    return NextResponse.json({ error: "Innhold og dato er påkrevd" }, { status: 400 });
  }

  // Upsert: one note per user per day
  const note = await prisma.dailyNote.upsert({
    where: { userId_date: { userId, date } },
    update: { content: content.trim() },
    create: { content: content.trim(), date, userId },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ note }, { status: 201 });
}
