import { ListSkeleton } from '@/components/ui/skeleton'

export default function CommunityLoading() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ height: '28px', width: '200px', background: '#deebf7', borderRadius: '8px', marginBottom: '24px' }} aria-hidden />
      <ListSkeleton count={4} />
    </div>
  )
}
