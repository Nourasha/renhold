// src/components/layout/NavLinks.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard",           label: "Oversikt",          icon: "🏠" },
  { href: "/dashboard/oppgaver",  label: "Arbeidsoppgaver",   icon: "📋" },
  { href: "/dashboard/ferdige",   label: "Ferdige oppgaver",  icon: "✅" },
  { href: "/dashboard/ukeplan",   label: "Ukeplan",           icon: "📅" },
  { href: "/dashboard/avvik",     label: "Avvik",             icon: "⚠️" },
];

interface Props {
  role?: string;
  onClick?: () => void;
}

export function NavLinks({ role, onClick }: Props) {
  const pathname = usePathname();

  function linkClass(href: string) {
    const isActive = pathname === href || pathname.startsWith(href + "?");
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  }

  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} onClick={onClick} className={linkClass(item.href)}>
          <span className="text-base">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
        </Link>
      ))}
      {role === "admin" && (
        <Link href="/dashboard/admin" onClick={onClick} className={linkClass("/dashboard/admin")}>
          <span className="text-base">🔑</span>
          Admin panel
        </Link>
      )}
    </>
  );
}
