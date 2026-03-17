// src/app/api/admin/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const plainCode = crypto.randomBytes(6).toString("hex").toUpperCase();
  const codeHash = await bcrypt.hash(plainCode, 10);

  await prisma.inviteCode.create({
    data: { codeHash, createdBy: (session.user as any).id },
  });

  return NextResponse.json({ code: plainCode }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const codes = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const safe = codes.map(
    ({
      codeHash: _hash,
      ...rest
    }: {
      codeHash: string;
      [key: string]: unknown;
    }) => rest,
  );
  return NextResponse.json({ codes: safe });
}
