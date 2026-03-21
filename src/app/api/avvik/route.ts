// src/app/api/avvik/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToAll } from "@/lib/pushNotification";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const deviations = await prisma.deviation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ deviations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const { title, description, severity } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: "Tittel og beskrivelse er påkrevd" }, { status: 400 });
  }

  const deviation = await prisma.deviation.create({
    data: { title, description, severity: severity || "low", userId },
    include: { user: { select: { id: true, name: true } } },
  });

  // Send push notification to all other users
  const senderName = (session.user as any).name || "En bruker";
  const severityLabel: Record<string, string> = {
    low: "Lav", medium: "Middels", high: "Høy", critical: "Kritisk"
  };

  await sendPushToAll(
    {
      title: `⚠️ Nytt avvik: ${title}`,
      body: `${senderName} registrerte et avvik (${severityLabel[severity] || "Lav"})`,
      url: "/dashboard/avvik",
    },
    userId // exclude sender
  );

  return NextResponse.json({ deviation }, { status: 201 });
}
