import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex gap-2'>
      <Button className='gap-x-1' onClick={() => setOpen('add')}>
        <UserPlus className='h-4 w-4' />
        <span>Add User</span>
      </Button>
    </div>
  )
}
