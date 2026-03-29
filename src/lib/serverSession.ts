import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ServerUser = { id: string; role?: string; name?: string | null };

export async function requireSession(): Promise<ServerUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string; name?: string } | undefined;

  if (!session || !user?.id) {
    throw new Error("Ikke autorisert");
  }

  return user as ServerUser;
}

export async function requireAdmin(): Promise<ServerUser> {
  const user = await requireSession();

  if (user.role !== "admin") {
    throw new Error("Kun admin har tilgang");
  }

  return user;
}
