'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createComment } from '@/features/community/actions'
import { Button } from '@/components/ui/button'
import styles from './post-detail.module.css'

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const content = form.get('content') as string

    startTransition(async () => {
      const result = await createComment(postId, { content })
      if ('error' in result) {
        setError(result.error)
      } else {
        event.currentTarget.reset()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm} noValidate>
      <label htmlFor="comment" className={styles.commentFormLabel}>Write a reply</label>
      <textarea
        id="comment"
        name="content"
        rows={3}
        maxLength={2000}
        required
        className={styles.commentTextarea}
        placeholder="Share your thoughts…"
      />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.commentActions}>
        <Button type="submit" loading={isPending} size="sm">
          {isPending ? 'Posting…' : 'Post Reply'}
        </Button>
      </div>
    </form>
  )
}
