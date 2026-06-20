import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSmtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP not configured");
  }
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return { transporter, SMTP_FROM, SMTP_USER };
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  try {
    const { transporter, SMTP_FROM, SMTP_USER } = await getSmtpConfig();
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_USER,
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
