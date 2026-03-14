// src/app/api/avvik/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  // Admin can update any deviation; others only their own
  const where =
    role === "admin" ? { id: params.id } : { id: params.id, userId };

  const body = await req.json();
  const updated = await prisma.deviation.updateMany({ where, data: body });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Ikke funnet eller ingen tilgang" },
      { status: 403 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  // Admin can delete any deviation; others only their own
  const where =
    role === "admin" ? { id: params.id } : { id: params.id, userId };

  const deleted = await prisma.deviation.deleteMany({ where });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Ikke funnet eller ingen tilgang" },
      { status: 403 },
    );
  }

  return NextResponse.json({ success: true });
}
