// src/app/dashboard/avvik/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeviationList } from "@/components/DeviationList";

export const revalidate = 0;

export default async function AvvikPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role ?? "user";

  // Fetch ALL deviations from all users
  const deviations = await prisma.deviation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avvik</h1>
        <p className="text-gray-500 mt-1">
          Registrer og følg opp avvik og hendelser
        </p>
      </div>
      <DeviationList
        initialDeviations={deviations as any}
        currentUserId={userId}
        currentUserRole={userRole}
      />
    </div>
  );
}
