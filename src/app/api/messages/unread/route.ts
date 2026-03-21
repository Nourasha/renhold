// src/app/api/messages/unread/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const userId = (session.user as any).id;

  // Get all messages not sent by this user
  const messages = await prisma.message.findMany({
    where: {
      senderId: { not: userId },
      OR: [
        { receiverId: null },           // group messages
        { receiverId: userId },          // private messages to me
      ],
    },
    select: { readBy: true },
  });

  const unread = messages.filter((m) => {
    const readBy: string[] = JSON.parse(m.readBy || "[]");
    return !readBy.includes(userId);
  }).length;

  return NextResponse.json({ count: unread });
}
