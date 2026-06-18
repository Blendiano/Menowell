import { CardSkeleton } from '@/components/ui/skeleton'

export default function LearnLoading() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ height: '28px', width: '250px', background: '#deebf7', borderRadius: '8px', marginBottom: '24px' }} aria-hidden />
      <div style={{ display: 'grid', gap: '16px' }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
