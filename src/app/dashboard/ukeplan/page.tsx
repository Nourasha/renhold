// src/app/dashboard/ukeplan/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WeekPlanView } from "@/components/WeekPlanView";

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

export default async function UkeplanPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const currentWeek = getCurrentWeek();
  const currentYear = new Date().getFullYear();

  const weekPlans = await prisma.weekPlan.findMany({
    where: { userId, weekNumber: currentWeek, year: currentYear },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ukeplan</h1>
        <p className="text-gray-500 mt-1">
          Uke {currentWeek}, {currentYear}
        </p>
      </div>
      <WeekPlanView
        initialPlans={weekPlans}
        weekNumber={currentWeek}
        year={currentYear}
      />
    </div>
  );
}
