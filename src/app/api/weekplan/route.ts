// src/app/api/weekplan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  const userId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const weekNumber = parseInt(searchParams.get("week") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  const plans = await prisma.weekPlan.findMany({
    where: { userId, weekNumber, year },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  const userId = (session.user as any).id;

  const { title, description, weekNumber, year, dayOfWeek, startTime, endTime } = await req.json();

  if (!title || !weekNumber || !year || !dayOfWeek) {
    return NextResponse.json({ error: "Manglende påkrevde felt" }, { status: 400 });
  }

  const plan = await prisma.weekPlan.create({
    data: { title, description, weekNumber, year, dayOfWeek, startTime, endTime, userId },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
