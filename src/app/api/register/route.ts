// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, inviteCode } = await req.json();

    if (!name || !email || !password || !inviteCode) {
      return NextResponse.json({ error: "Alle felt er påkrevd" }, { status: 400 });
    }

    // Find all unused codes and bcrypt-compare against each
    const unusedCodes = await prisma.inviteCode.findMany({
      where: { used: false },
    });

    let matchedCode: typeof unusedCodes[number] | null = null;
    for (const row of unusedCodes) {
      const match = await bcrypt.compare(inviteCode, row.codeHash);
      if (match) { matchedCode = row; break; }
    }

    if (!matchedCode) {
      return NextResponse.json({ error: "Ugyldig passkode" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "E-post er allerede registrert" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword, role: "user" },
      });
      await tx.inviteCode.update({
        where: { id: matchedCode!.id },
        data: { used: true, usedAt: new Date(), usedBy: newUser.id },
      });
      return newUser;
    });

    return NextResponse.json({ message: "Bruker opprettet", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Noe gikk galt. Prøv igjen." }, { status: 500 });
  }
}
