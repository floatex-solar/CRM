import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/features/tasks/hooks/use-notifications-api'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCountQuery()
  const { data, isLoading } = useNotificationsQuery(1, 20)
  const markAsRead = useMarkAsReadMutation()
  const markAllAsRead = useMarkAllAsReadMutation()
  const navigate = useNavigate()

  const notifications = data?.notifications ?? []

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead.mutate(notification._id)
    }

    // Navigate to tasks with the task ID
    const taskId =
      typeof notification.taskId === 'string'
        ? notification.taskId
        : notification.taskId?._id
    if (taskId) {
      navigate({ to: '/tasks', search: { taskId } })
    }

    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h4 className='text-sm font-semibold'>Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => markAllAsRead.mutate()}
              className='h-7 gap-x-1 text-xs'
            >
              <CheckCheck className='h-3.5 w-3.5' />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className='max-h-80'>
          {isLoading ? (
            <div className='flex h-20 items-center justify-center'>
              <span className='text-xs text-muted-foreground'>Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex h-20 items-center justify-center'>
              <span className='text-xs text-muted-foreground'>
                No notifications
              </span>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent',
                    !n.isRead && 'bg-primary/5'
                  )}
                >
                  <div className='flex items-start gap-2'>
                    {!n.isRead && (
                      <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary' />
                    )}
                    <p
                      className={cn(
                        'flex-1 text-xs',
                        !n.isRead ? 'font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {n.message}
                    </p>
                  </div>
                  <span className='text-[10px] text-muted-foreground'>
                    {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
