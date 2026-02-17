import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompanies } from './companies-provider'

export function CompaniesPrimaryButtons() {
  const { setOpen } = useCompanies()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Company</span> <Plus size={18} />
      </Button>
    </div>
  )
}
