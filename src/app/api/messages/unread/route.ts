// src/app/api/messages/unread/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0, perUser: {}, group: 0 });

  const userId = (session.user as any).id;

  const messages = await prisma.message.findMany({
    where: {
      senderId: { not: userId },
      OR: [
        { receiverId: null },
        { receiverId: userId },
      ],
    },
    select: { readBy: true, senderId: true, receiverId: true },
  });

  let group = 0;
  const perUser: Record<string, number> = {};

  for (const msg of messages) {
    const readBy: string[] = JSON.parse(msg.readBy || "[]");
    if (readBy.includes(userId)) continue;

    if (!msg.receiverId) {
      // Group message
      group++;
    } else {
      // Private message — count per sender
      perUser[msg.senderId] = (perUser[msg.senderId] || 0) + 1;
    }
  }

  const count = group + Object.values(perUser).reduce((a, b) => a + b, 0);

  return NextResponse.json({ count, perUser, group });
}
