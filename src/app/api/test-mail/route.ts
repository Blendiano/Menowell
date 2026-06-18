import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sendMail } = await import("@/lib/mail");
    const { env } = await import("@/lib/env");

    const info = await sendMail({
      to: env.SMTP_USER,
      subject: "Menowell SMTP Test",
      html: "<h1>SMTP Test</h1><p>If you receive this, SMTP is working!</p>",
    });
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
