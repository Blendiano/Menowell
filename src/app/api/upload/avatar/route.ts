import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 2 MB.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF.' }, { status: 400 })
    }

    const fileName = file.name || 'image'
    const rawExt = fileName.split('.').pop()?.toLowerCase() ?? ''
    const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg'
    const filename = `${crypto.randomUUID()}.${ext}`

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    let buffer: Buffer
    try {
      buffer = Buffer.from(await file.arrayBuffer())
    } catch {
      const chunks: Uint8Array[] = []
      const reader = file.stream().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      buffer = Buffer.concat(chunks)
    }

    const filepath = path.join(UPLOAD_DIR, filename)
    await fs.writeFile(filepath, buffer)

    return NextResponse.json({ data: { url: `/uploads/avatars/${filename}` } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : ''
    console.error('Avatar upload error:', msg, stack)
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 })
  }
}
