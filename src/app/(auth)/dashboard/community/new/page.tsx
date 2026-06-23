'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/features/community/actions'
import { logNavigation } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import styles from './new-post.module.css'

export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)

    startTransition(async () => {
      const content = (form.get('content') as string) ?? ''
      const result = await createPost({
        content,
        anonymous: form.get('anonymous') === 'on',
      })

      if ('error' in result) {
        setError(result.error ?? 'Something went wrong.')
      } else if ('data' in result && result.data?.id) {
        const target = `/dashboard/community/${result.data.id}`
        logNavigation({ to: target, ids: { postId: result.data.id }, apiResponse: result })
        router.push(target)
      } else {
        const target = '/dashboard/community'
        logNavigation({ to: target, apiResponse: result })
        router.push(target)
      }
    })
  }

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Create a Post</h1>
      <p className={styles.subtitle}>Share your thoughts, questions, or experiences with the community.</p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="content" className={styles.label}>What&apos;s on your mind?</label>
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            rows={6}
            maxLength={5000}
            required
            className={styles.textarea}
            placeholder="Share something supportive, ask a question, or start a discussion…"
          />
          <span className={styles.charCount}>Max 5,000 characters</span>
        </div>

        <label className={styles.checkbox}>
          <input type="checkbox" name="anonymous" />
          <span>Post anonymously</span>
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isPending ? 'Posting…' : 'Post to Community'}
          </Button>
        </div>
      </form>
    </main>
  )
}
