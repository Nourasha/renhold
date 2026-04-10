// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AvvikCount } from "@/components/notifications/AvvikCount";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const deviations = await prisma.deviation.count({
    where: { status: { not: "resolved" } },
  });

  const staticCards = [
    {
      title: "Arbeidsoppgaver",
      description: "Ukentlig sjekkliste for dagens arbeidsoppgaver",
      href: "/dashboard/oppgaver",
      icon: "📋",
      cardClass: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      titleHover: "group-hover:text-blue-700",
    },
    {
      title: "Ferdige oppgaver",
      description: "Godkjente oppgaver og notater",
      href: "/dashboard/ferdige",
      icon: "✅",
      cardClass: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      titleHover: "group-hover:text-emerald-700",
    },
    {
      title: "Ukeplan",
      description: "Planlegg og se ukens aktiviteter",
      href: "/dashboard/ukeplan",
      icon: "📅",
      cardClass: "bg-violet-50 border-violet-200 hover:bg-violet-100",
      titleHover: "group-hover:text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hei, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Her er en oversikt over arbeidsområdene dine
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {staticCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`${card.cardClass} rounded-xl shadow-sm border p-6 hover:shadow-md transition-all group`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
            </div>
            <h2 className={`text-lg font-semibold text-gray-900 ${card.titleHover} transition-colors`}>
              {card.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
          </Link>
        ))}

        <Link
          href="/dashboard/avvik"
          className="bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl">⚠️</span>
            <AvvikCount initialCount={deviations} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
            Avvik
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Registrerte avvik og hendelser
          </p>
        </Link>
      </div>
    </div>
  );
}
