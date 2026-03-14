// src/app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={session.user as any} />
      {/* pt-14 on mobile to clear the fixed top bar; md:pt-0 on desktop */}
      <main className="flex-1 p-4 md:p-6 pt-[72px] md:pt-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
