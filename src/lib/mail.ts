import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
  console.warn("SMTP not configured — email features are disabled.");
}

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER!, pass: SMTP_PASS! },
    })
  : null;

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    throw new Error("SMTP not configured. Set SMTP_* environment variables.");
  }
  const info = await transporter.sendMail({
    from: `"Menowell" <${SMTP_FROM!}>`,
    to,
    subject,
    html,
  });
  return info;
}
