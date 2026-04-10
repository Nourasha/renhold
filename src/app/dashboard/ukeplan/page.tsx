// src/app/dashboard/ukeplan/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WeekPlanView } from "@/components/weekplan/WeekPlanView";

export default async function UkeplanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const weekPlans = await prisma.weekPlan.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ukeplan</h1>
        <p className="text-gray-500 mt-1">Felles ukeplan for alle ansatte</p>
      </div>
      <WeekPlanView initialPlans={weekPlans} />
    </div>
  );
}
