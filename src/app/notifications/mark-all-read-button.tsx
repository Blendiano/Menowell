'use client'

import { useTransition } from 'react'
import { markAllAsRead } from '@/features/notifications/actions'
import { Button } from '@/components/ui/button'

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <form action={() => startTransition(() => markAllAsRead())}>
      <Button type="submit" variant="ghost" size="sm" loading={isPending}>
        Mark all as read
      </Button>
    </form>
  )
}
