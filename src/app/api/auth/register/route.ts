import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, passwordHash, role: "client" },
    });

    // Resolve spa ID: prefer env var, fall back to first spa in DB
    const spaId = process.env.DEFAULT_SPA_ID || null;
    const resolvedSpaId = spaId || (await prisma.spa.findFirst({ select: { id: true } }))?.id || null;

    if (resolvedSpaId) {
      await prisma.loyaltyAccount.create({
        data: { clientId: user.id, spaId: resolvedSpaId },
      });
    }

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err: any) {
    console.error("[register]", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
