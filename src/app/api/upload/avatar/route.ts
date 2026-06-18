import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
const MAX_SIZE = 2 * 1024 * 1024

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 2 MB.' }, { status: 400 })
    }

    const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
    const ext = ALLOWED_EXTS.has(rawExt) ? rawExt : 'jpg'
    const filename = `${crypto.randomUUID()}.${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })

    const bytes = Buffer.from(await file.arrayBuffer())
    const filepath = path.join(UPLOAD_DIR, filename)
    await writeFile(filepath, bytes)

    return NextResponse.json({ data: { url: `/uploads/avatars/${filename}` } })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 })
  }
}
