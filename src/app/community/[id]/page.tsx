import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CommentForm } from './comment-form'
import type { CommunityPost, Comment, User } from '@prisma/client'
import styles from './post-detail.module.css'

export const dynamic = 'force-dynamic'

type TPostWithRelations = CommunityPost & {
  user: Pick<User, 'name'> | null
  comments: (Comment & { user: Pick<User, 'name'> | null })[]
  _count: { reactions: number }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth')

  const { id } = await params

  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true } } },
      },
      _count: { select: { reactions: true } },
    },
  }) as TPostWithRelations | null

  if (!post) {
    return (
      <main className={styles.root}>
        <h1 className={styles.title}>Post not found</h1>
        <p className={styles.subtitle}>This post may have been removed or doesn&apos;t exist.</p>
      </main>
    )
  }

  const authorName = post.anonymous ? 'Anonymous' : post.user?.name ?? 'Member'

  return (
    <main className={styles.root}>
      <article className={styles.post}>
        <div className={styles.postHeader}>
          <span className={styles.author}>{authorName}</span>
          <span className={styles.date}>
            {new Date(post.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>
        <p className={styles.content}>{post.content}</p>
        <div className={styles.meta}>
          <span>{post._count.reactions} {post._count.reactions === 1 ? 'reaction' : 'reactions'}</span>
          <span>{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</span>
        </div>
      </article>

      <section className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>Replies ({post.comments.length})</h2>

        {post.comments.length === 0 ? (
          <div className={styles.emptyComments}>
            <p>No replies yet. Be the first to respond.</p>
          </div>
        ) : (
          <ul className={styles.commentsList}>
            {post.comments.map((comment) => (
              <li key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.user?.name ?? 'Member'}
                  </span>
                  <span className={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
              </li>
            ))}
          </ul>
        )}

        <CommentForm postId={id} />
      </section>
    </main>
  )
}
