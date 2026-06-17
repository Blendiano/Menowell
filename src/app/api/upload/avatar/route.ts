import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024

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

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${crypto.randomUUID()}.${ext}`
    const bytes = Buffer.from(await file.arrayBuffer())
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'avatars', filename)
    await writeFile(filepath, bytes)

    return NextResponse.json({ data: { url: `/uploads/avatars/${filename}` } })
  } catch {
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 })
  }
}
