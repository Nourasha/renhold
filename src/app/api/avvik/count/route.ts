import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.deviation.count({
      where: { status: { not: "resolved" } },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Feil i /api/avvik/count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
