// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const adminId = (session.user as any).id;
  if (params.id === adminId) {
    return NextResponse.json({ error: "Du kan ikke slette deg selv" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 });
  }

  // Cascade deletes all related data via Prisma schema onDelete: Cascade
  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
