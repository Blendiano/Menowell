import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { env } from '@/lib/env'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

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

    await sendMail({
      to: user.email!,
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
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
