import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { env } from '@/lib/env'
import crypto from 'crypto'
import { z } from 'zod'

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ForgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ data: { message: 'If an account exists, a reset link has been sent.' } })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    })

    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`
    const recipientEmail = user.email

    if (!recipientEmail) {
      console.error('User has no email for password reset:', user.id)
      return NextResponse.json({ data: { message: 'If an account exists, a reset link has been sent.' } })
    }

    await sendMail({
      to: recipientEmail,
      subject: 'Reset your Menowell password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h1 style="color:#690cb0;">Menowell</h1>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#690cb0;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
            Reset password
          </a>
          <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ data: { message: 'If an account exists, a reset link has been sent.' } })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
