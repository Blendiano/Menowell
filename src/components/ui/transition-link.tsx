'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type TTransitionLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

export function TransitionLink({ href, children, className }: TTransitionLinkProps) {
  const router = useRouter()

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById('page-root')?.setAttribute('data-leaving', 'true')
        setTimeout(() => {
          router.push(href)
        }, 400)
      }}
    >
      {children}
    </a>
  )
}
