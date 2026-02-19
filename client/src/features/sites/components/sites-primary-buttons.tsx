import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSites } from './sites-provider'

export function SitesPrimaryButtons() {
  const { setOpen } = useSites()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Site</span> <Plus size={18} />
      </Button>
    </div>
  )
}
