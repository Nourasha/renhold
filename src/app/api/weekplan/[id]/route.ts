// src/app/api/weekplan/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  const userId = (session.user as any).id;

  await prisma.weekPlan.deleteMany({ where: { id: params.id, userId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const plan = await prisma.weekPlan.updateMany({ where: { id: params.id, userId }, data: body });
  return NextResponse.json({ plan });
}
