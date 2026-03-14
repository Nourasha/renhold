// src/app/dashboard/ferdige/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompletedChecklist } from "@/components/CompletedChecklist";

export default async function FerdigeOppgaverPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const today = new Date().toISOString().split("T")[0];

  const [completions, notes] = await Promise.all([
    prisma.checklistCompletion.findMany({
      orderBy: { completedAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true } },
        item: {
          include: { group: { select: { title: true, color: true } } },
        },
      },
    }),
    prisma.dailyNote.findMany({
      orderBy: { date: "desc" },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ferdige oppgaver</h1>
        <p className="text-gray-500 mt-1">Godkjente oppgaver og notater per dag</p>
      </div>

      <CompletedChecklist
        completions={completions as any}
        initialNotes={notes as any}
        currentUserId={userId}
        today={today}
      />
    </div>
  );
}
