// src/app/dashboard/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminInvitePanel } from "@/components/AdminInvitePanel";
import { AdminUserPanel } from "@/components/AdminUserPanel";

export default async function AdminPage() {
  // Role check handled by middleware
  const session = await getServerSession(authOptions);

  const [codes, users] = await Promise.all([
    prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, used: true, createdAt: true, usedAt: true, usedBy: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin panel</h1>
        <p className="text-gray-500 mt-1">Administrer brukere og passkoder</p>
      </div>

      <AdminUserPanel
        initialUsers={users}
        currentUserId={(session?.user as any)?.id}
      />

      <AdminInvitePanel initialCodes={codes as any} />
    </div>
  );
}
