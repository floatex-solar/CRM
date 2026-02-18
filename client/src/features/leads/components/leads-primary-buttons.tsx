import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLeads } from './leads-provider'

export function LeadsPrimaryButtons() {
  const { setOpen } = useLeads()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Lead</span> <Plus size={18} />
      </Button>
    </div>
  )
}
