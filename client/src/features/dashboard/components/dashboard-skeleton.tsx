import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonCard() {
  return (
    <div className='rounded-lg border bg-card p-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-7 w-7 rounded-md' />
      </div>
      <div className='mt-2'>
        <Skeleton className='h-8 w-16' />
      </div>
      <Skeleton className='mt-1 h-3 w-32' />
    </div>
  )
}

function SkeletonSection({ cards }: { cards: number }) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-5 w-36' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
          <Skeleton className='h-8 w-52' />
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <Skeleton className='mb-4 h-[220px] w-full rounded-md' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Summary cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonSection cards={3} />
      <SkeletonSection cards={5} />
      <SkeletonSection cards={3} />
      <SkeletonSection cards={8} />
    </div>
  )
}
