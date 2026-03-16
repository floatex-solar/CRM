import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-4' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-8 w-16' />
        <Skeleton className='mt-1 h-3 w-32' />
      </CardContent>
    </Card>
  )
}

function SkeletonSection({
  cards,
  title,
}: {
  cards: number
  title?: boolean
}) {
  return (
    <div className='space-y-2'>
      {title && <Skeleton className='h-5 w-40' />}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <SkeletonSection cards={4} title />
      <SkeletonSection cards={3} title />
      <SkeletonSection cards={5} title />
      <SkeletonSection cards={3} title />
      <SkeletonSection cards={8} title />
    </div>
  )
}
