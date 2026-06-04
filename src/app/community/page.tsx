import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { CommunityPost, User } from '@prisma/client'
import Link from 'next/link'
import styles from './community.module.css'

export default async function CommunityPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      _count: { select: { comments: true, reactions: true } },
      user: { select: { name: true } },
    },
  })

  return (
    <main className={styles.root}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Community</h1>
        <Link href="/community/new" className={styles.newPostBtn}>+ New post</Link>
      </div>
      <p className={styles.subtitle}>A safe space to share and support one another.</p>

      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>Be the first to start a conversation in the community.</p>
          <Link href="/community/new" className={styles.newPostBtn}>Start a post</Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {posts.map((post: CommunityPost & { user: Pick<User, 'name'> | null; _count: { comments: number; reactions: number } }) => (
            <li key={post.id} className={styles.postCard}>
              <p className={styles.author}>{post.anonymous ? 'Anonymous' : post.user?.name ?? 'Member'}</p>
              <p className={styles.content}>{post.content}</p>
              <div className={styles.meta}>
                <span>{post._count.comments} {post._count.comments === 1 ? 'reply' : 'replies'}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
