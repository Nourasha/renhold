// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  const userId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const tasks = await prisma.task.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  const userId = (session.user as any).id;

  const { title, description, priority, dueDate } = await req.json();
  if (!title) return NextResponse.json({ error: "Tittel er påkrevd" }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      userId,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
