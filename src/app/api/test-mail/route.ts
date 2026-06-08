import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { env } from "@/lib/env";

export async function GET() {
  try {
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
