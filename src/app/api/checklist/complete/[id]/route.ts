// src/app/api/checklist/complete/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;

  // Only the owner of the completion can delete it
  const completion = await prisma.checklistCompletion.findUnique({
    where: { id: params.id },
  });

  if (!completion) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  if (completion.userId !== userId) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  await prisma.checklistCompletion.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
