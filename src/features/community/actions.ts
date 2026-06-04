'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createPost as createPostService, createComment as createCommentService, toggleReaction as toggleReactionService, CreatePostSchema, CreateCommentSchema } from '@/services/community-service'

export async function createPost(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const parsed = CreatePostSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  try {
    await createPostService(session.user.id, parsed.data)
    revalidatePath('/community')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to create post.' }
  }
}

export async function createComment(postId: string, input: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const parsed = CreateCommentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  try {
    await createCommentService(session.user.id, postId, parsed.data)
    revalidatePath(`/community/${postId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to create comment.' }
  }
}

export async function toggleReaction(postId: string, type: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  try {
    const result = await toggleReactionService(session.user.id, postId, type)
    revalidatePath(`/community/${postId}`)
    return { data: result }
  } catch {
    return { error: 'Failed to toggle reaction.' }
  }
}
