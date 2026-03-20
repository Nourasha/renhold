// src/app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session is guaranteed by middleware — no need to redirect here
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={session?.user as any} />
      <main className="flex-1 p-4 md:p-6 pt-[72px] md:pt-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
