import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(5000),
  anonymous: z.coerce.boolean().default(false),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
})

export type TCreatePostInput = z.infer<typeof CreatePostSchema>
export type TCreateCommentInput = z.infer<typeof CreateCommentSchema>

export async function getPosts(limit = 30) {
  return prisma.communityPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { comments: true, reactions: true } },
      user: { select: { name: true } },
    },
  })
}

export async function getPostById(postId: string) {
  return prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: { select: { name: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true } } },
      },
      _count: { select: { reactions: true } },
    },
  })
}

export async function createPost(userId: string, input: TCreatePostInput) {
  const parsed = CreatePostSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.message)

  return prisma.communityPost.create({
    data: { userId, content: parsed.data.content, anonymous: parsed.data.anonymous },
    select: { id: true },
  })
}

export async function createComment(userId: string, postId: string, input: TCreateCommentInput) {
  const parsed = CreateCommentSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.message)

  return prisma.comment.create({
    data: { userId, postId, content: parsed.data.content },
    select: { id: true },
  })
}

export async function toggleReaction(userId: string, postId: string, type: string) {
  const existing = await prisma.reaction.findFirst({
    where: { postId, userId, type },
    select: { id: true },
  })

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
    return { reacted: false }
  }

  await prisma.reaction.create({
    data: { postId, userId, type },
    select: { id: true },
  })
  return { reacted: true }
}
