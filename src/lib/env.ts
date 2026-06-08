import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().positive(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().email(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
