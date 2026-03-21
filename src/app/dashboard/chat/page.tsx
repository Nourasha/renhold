// src/app/dashboard/chat/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatView } from "@/components/ChatView";

export const revalidate = 0;

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { with?: string };
}) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const withUserId = searchParams.with || null;

  const [users, messages] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    withUserId
      ? prisma.message.findMany({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: withUserId },
              { senderId: withUserId, receiverId: currentUserId },
            ],
          },
          orderBy: { createdAt: "asc" },
          take: 100,
          include: { sender: { select: { id: true, name: true } } },
        })
      : prisma.message.findMany({
          where: { receiverId: null },
          orderBy: { createdAt: "asc" },
          take: 100,
          include: { sender: { select: { id: true, name: true } } },
        }),
  ]);

  return (
    <ChatView
      currentUser={{ id: currentUserId, name: session?.user?.name || "" }}
      users={users as any}
      initialMessages={messages as any}
      activeConversation={withUserId}
    />
  );
}
