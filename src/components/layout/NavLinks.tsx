"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Oversikt", icon: "🏠" },
  { href: "/dashboard/oppgaver", label: "Arbeidsoppgaver", icon: "📋", noCache: true },
  { href: "/dashboard/ferdige", label: "Ferdige oppgaver", icon: "✅", noCache: true },
  { href: "/dashboard/ukeplan", label: "Ukeplan", icon: "📅" },
  { href: "/dashboard/avvik", label: "Avvik", icon: "⚠️", noCache: true, showAvvikBadge: true },
];

interface Props {
  role?: string;
  onClick?: () => void;
}

export function NavLinks({ role, onClick }: Props) {
  const pathname = usePathname();
  const [avvikCount, setAvvikCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/avvik/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setAvvikCount(data.count);
      } catch (error) {
        console.error("Feil ved henting av avvik-count:", error);
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  function linkClass(href: string) {
    const isActive = pathname === href || pathname.startsWith(href + "?");
    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  }

  return (
    <>
      {navItems.map((item) =>
        item.noCache ? (
          <a
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={linkClass(item.href)}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.showAvvikBadge && avvikCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {avvikCount}
              </span>
            )}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={onClick}
            className={linkClass(item.href)}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </Link>
        ),
      )}

      {role === "admin" && (
        <Link
          href="/dashboard/admin"
          prefetch={false}
          onClick={onClick}
          className={linkClass("/dashboard/admin")}
        >
          <span className="text-base">🔑</span>
          Admin panel
        </Link>
      )}
    </>
  );
}
