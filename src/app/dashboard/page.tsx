// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [deviations] = await Promise.all([
    prisma.deviation.count({ where: { status: { not: "resolved" } } }),
  ]);

  const cards = [
    {
      title: "Arbeidsoppgaver",
      description: "Ukentlig sjekkliste for dagens arbeidsoppgaver",
      count: null,
      countLabel: null,
      href: "/dashboard/oppgaver",
      color: "bg-blue-500",
      icon: "📋",
    },
    {
      title: "Ferdige oppgaver",
      description: "Godkjente oppgaver og notater",
      count: null,
      countLabel: null,
      href: "/dashboard/ferdige",
      color: "bg-green-500",
      icon: "✅",
    },
    {
      title: "Ukeplan",
      description: "Planlegg og se ukens aktiviteter",
      count: null,
      countLabel: null,
      href: "/dashboard/ukeplan",
      color: "bg-purple-500",
      icon: "📅",
    },
    {
      title: "Avvik",
      description: "Registrerte avvik og hendelser",
      count: deviations,
      countLabel: "ubehandlede avvik",
      href: "/dashboard/avvik",
      color: "bg-red-500",
      icon: "⚠️",
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
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              {card.count !== null && (
                <span
                  className={`${card.color} text-white text-xs font-bold px-2 py-1 rounded-full`}
                >
                  {card.count}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {card.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
            {card.count !== null && (
              <p className="text-xs text-gray-400 mt-3">
                {card.count} {card.countLabel}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
