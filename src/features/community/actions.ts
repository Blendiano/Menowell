'use server'

import { requireAuth } from '@/lib/require-auth'
import { revalidatePath } from 'next/cache'
import { createPost as createPostService, createComment as createCommentService, toggleReaction as toggleReactionService, CreatePostSchema, CreateCommentSchema } from '@/services/community-service'

export async function createPost(input: unknown) {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  const parsed = CreatePostSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  try {
    const post = await createPostService(userId, parsed.data)
    revalidatePath('/dashboard/community')
    revalidatePath('/dashboard')
    return { data: { id: post.id } }
  } catch (error) {
    console.error('createPost error:', error)
    return { error: 'Failed to create post.' }
  }
}

export async function createComment(postId: string, input: unknown) {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  const parsed = CreateCommentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  try {
    await createCommentService(userId, postId, parsed.data)
    revalidatePath(`/dashboard/community/${postId}`)
    revalidatePath('/dashboard/community')
    return { data: { success: true } }
  } catch (error) {
    console.error('createComment error:', error)
    return { error: 'Failed to create comment.' }
  }
}

export async function toggleReaction(postId: string, type: string) {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  try {
    const result = await toggleReactionService(userId, postId, type)
    revalidatePath(`/dashboard/community/${postId}`)
    revalidatePath('/dashboard/community')
    return { data: result }
  } catch (error) {
    console.error('toggleReaction error:', error)
    return { error: 'Failed to toggle reaction.' }
  }
}
