// src/app/dashboard/oppgaver/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChecklistBoard } from "@/components/ChecklistBoard";

export default async function OppgaverPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const today = new Date().toISOString().split("T")[0];

  const groups = await prisma.checklistGroup.findMany({
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          completions: {
            where: { date: today },
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Arbeidsoppgaver</h1>
        <p className="text-gray-500 mt-1">
          Ukentlig sjekkliste – huk av og godkjenn dine oppgaver for i dag
        </p>
      </div>

      <ChecklistBoard
        initialGroups={groups as any}
        currentUserId={userId}
        today={today}
      />
    </div>
  );
}
