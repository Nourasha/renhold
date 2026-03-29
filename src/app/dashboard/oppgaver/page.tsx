import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChecklistBoard } from "@/components/checklist/ChecklistBoard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OppgaverPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as {
    id?: string;
    name?: string | null;
    role?: string;
  } | null;

  if (!user?.id) return null;

  const today = new Date().toISOString().split("T")[0];

  const rawGroups = await prisma.checklistGroup.findMany({
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          completions: {
            where: { date: today },
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  const groups = rawGroups.map((g) => ({
    ...g,
    items: g.items.map((i) => ({
      ...i,
      completions: i.completions.map((c) => ({
        ...c,
        completedAt: c.completedAt.toISOString(),
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Arbeidsoppgaver</h1>
        <p className="mt-1 text-gray-500">
          Ukentlig sjekkliste – huk av og godkjenn dine oppgaver for i dag
        </p>
      </div>

      <ChecklistBoard
        initialGroups={groups}
        currentUserId={user.id}
        currentUserName={user.name ?? "Ukjent"}
        today={today}
        isAdmin={user.role === "admin"}
      />
    </div>
  );
}
