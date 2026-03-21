// src/app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { PushPermissionBanner } from "@/components/PushPermissionBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;

  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={session?.user as any} />
      <main className="flex-1 p-4 md:p-6 pt-[72px] md:pt-6 overflow-auto">
        {children}
      </main>
      <PushPermissionBanner />
      <FloatingChat
        currentUser={{ id: currentUserId, name: session?.user?.name || "" }}
        users={users}
      />
    </div>
  );
}
