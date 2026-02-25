import { format } from 'date-fns'
import {
  Calendar,
  User,
  Users,
  Paperclip,
  Mic,
  Video,
  ExternalLink,
  Flag,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { statuses, priorities } from '../data/data'
import { type Task } from '../data/schema'
import { useTaskDetailQuery } from '../hooks/use-tasks-api'
import { TaskTimeline } from './task-timeline'
import { TaskUpdateForm } from './task-update-form'

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Task
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  currentRow,
}: TaskDetailDialogProps) {
  const { data: fullTask, isLoading } = useTaskDetailQuery(
    open ? currentRow._id : null
  )
  const auth = useAuthStore((s) => s.auth)
  const task = fullTask ?? currentRow

  const status = statuses.find((s) => s.value === task.status)
  const priority = priorities.find((p) => p.value === task.priority)
  const StatusIcon = status?.icon
  const PriorityIcon = priority?.icon

  const isAssignee = auth.user?._id === task.assignedTo?._id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            <span className='flex-1'>{task.title}</span>
            {status && (
              <Badge
                variant='outline'
                className={cn(
                  'text-xs',
                  task.status === 'Done' && 'border-green-500 text-green-700',
                  task.status === 'In Progress' &&
                    'border-blue-500 text-blue-700',
                  task.status === 'Todo' && 'border-gray-400 text-gray-700'
                )}
              >
                {StatusIcon && <StatusIcon className='mr-1 h-3 w-3' />}
                {status.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex h-32 items-center justify-center'>
            <span className='text-sm text-muted-foreground'>
              Loading task details...
            </span>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Meta info grid */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              {/* Lead */}
              {task.lead && (
                <div className='flex items-start gap-2'>
                  <FileText className='mt-0.5 h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-xs font-medium text-muted-foreground'>
                      Lead
                    </p>
                    <p className='text-sm font-medium'>
                      {task.lead.jobCode} - {task.lead.projectName}
                    </p>
                  </div>
                </div>
              )}

              {/* Priority */}
              <div className='flex items-start gap-2'>
                <Flag className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Priority
                  </p>
                  <p
                    className={cn(
                      'inline-flex items-center gap-1 text-sm font-medium',
                      priority?.value === 'Urgent' && 'text-red-600',
                      priority?.value === 'High' && 'text-orange-600',
                      priority?.value === 'Medium' && 'text-yellow-600',
                      priority?.value === 'Low' && 'text-green-600'
                    )}
                  >
                    {PriorityIcon && <PriorityIcon className='h-3.5 w-3.5' />}
                    {priority?.label}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className='flex items-start gap-2'>
                <Calendar className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Due Date
                  </p>
                  <p className='text-sm'>
                    {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Assigned To */}
              <div className='flex items-start gap-2'>
                <User className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Assigned To
                  </p>
                  <p className='text-sm font-medium'>{task.assignedTo?.name}</p>
                </div>
              </div>

              {/* Assigned By */}
              <div className='flex items-start gap-2'>
                <User className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Assigned By
                  </p>
                  <p className='text-sm'>{task.assignedBy?.name}</p>
                </div>
              </div>

              {/* Assigned Date */}
              <div className='flex items-start gap-2'>
                <Calendar className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Assigned Date
                  </p>
                  <p className='text-sm'>
                    {format(new Date(task.assignedDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Watchers */}
            {task.watchers && task.watchers.length > 0 && (
              <div className='flex items-start gap-2'>
                <Users className='mt-0.5 h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='mb-1 text-xs font-medium text-muted-foreground'>
                    Watchers
                  </p>
                  <div className='flex flex-wrap gap-1'>
                    {task.watchers.map((w) => (
                      <Badge
                        key={w._id}
                        variant='secondary'
                        className='text-xs'
                      >
                        {w.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {task.description && (
              <div>
                <p className='mb-1 text-xs font-medium text-muted-foreground'>
                  Description
                </p>
                <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                  {task.description}
                </p>
              </div>
            )}

            {/* Original Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div>
                <div className='mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                  <Paperclip className='h-3 w-3' />
                  Attachments
                </div>
                <div className='flex flex-wrap gap-2'>
                  {task.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.driveUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors hover:bg-accent'
                    >
                      {att.originalName}
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Original Voice Note */}
            {task.voiceNote && (
              <div>
                <div className='mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                  <Mic className='h-3 w-3' />
                  Voice Note
                </div>
                <a
                  href={task.voiceNote.driveUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors hover:bg-accent'
                >
                  {task.voiceNote.originalName}
                  <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            )}

            {/* Original Video Note */}
            {task.videoNote && (
              <div>
                <div className='mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                  <Video className='h-3 w-3' />
                  Video Note
                </div>
                <a
                  href={task.videoNote.driveUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors hover:bg-accent'
                >
                  {task.videoNote.originalName}
                  <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            )}

            <Separator />

            {/* Update Form (only for assignee) */}
            {isAssignee && (
              <TaskUpdateForm taskId={task._id} currentStatus={task.status} />
            )}

            <Separator />

            {/* Timeline */}
            <div>
              <h3 className='mb-4 text-sm font-semibold'>Activity Timeline</h3>
              <TaskTimeline updates={task.updates ?? []} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
