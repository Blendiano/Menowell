import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  try {
    const { env } = await import("@/lib/env");
    const nodemailer = require("nodemailer");
    const { PrismaClient } = require("@prisma/client");

    const prisma = new PrismaClient();
    await prisma.$connect();

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to: env.SMTP_USER,
      subject: "Menowell SMTP Test",
      html: "<h1>SMTP Test</h1><p>If you receive this, SMTP is working!</p>",
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
