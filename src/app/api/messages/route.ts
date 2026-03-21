// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToAll, sendPushToUser } from "@/lib/pushNotification";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");

  let messages;

  if (!withUserId) {
    messages = await prisma.message.findMany({
      where: { receiverId: null },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { sender: { select: { id: true, name: true } } },
    });
  } else {
    messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { sender: { select: { id: true, name: true } } },
    });
  }

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const senderName = (session.user as any).name || "En bruker";
  const { content, receiverId } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Melding kan ikke være tom" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      senderId: userId,
      receiverId: receiverId || null,
      readBy: JSON.stringify([userId]),
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  // Send push notification
  if (receiverId) {
    // Private message — notify only receiver
    await sendPushToUser(receiverId, {
      title: `💬 Ny melding fra ${senderName}`,
      body: content.trim().slice(0, 80),
      url: `/dashboard/chat?with=${userId}`,
    });
  } else {
    // Group message — notify all others
    await sendPushToAll(
      {
        title: `💬 ${senderName}`,
        body: content.trim().slice(0, 80),
        url: "/dashboard/chat",
      },
      userId
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}
