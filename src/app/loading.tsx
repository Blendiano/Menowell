import { CardSkeleton } from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ height: '32px', width: '200px', background: '#deebf7', borderRadius: '8px', marginBottom: '8px' }} aria-hidden />
        <div style={{ height: '16px', width: '300px', background: '#deebf7', borderRadius: '8px' }} aria-hidden />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
