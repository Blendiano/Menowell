'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markAllAsRead } from '@/features/notifications/actions'
import { Button } from '@/components/ui/button'

export function MarkAllReadButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleClick() {
    startTransition(async () => {
      await markAllAsRead()
      router.refresh()
    })
  }

  return (
    <Button variant="ghost" size="sm" loading={isPending} onClick={handleClick}>
      Mark all as read
    </Button>
  )
}
