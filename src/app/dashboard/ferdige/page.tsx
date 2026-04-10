import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompletedChecklist } from "@/components/checklist/CompletedChecklist";
import { getShiftDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FerdigeOppgaverPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const today = getShiftDate();

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
        <p className="mt-1 text-gray-500">
          Godkjente oppgaver og notater per dag
        </p>
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
