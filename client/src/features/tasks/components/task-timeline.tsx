import { format } from 'date-fns'
import { Clock, Paperclip, Mic, Video, User, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { statuses } from '../data/data'
import { type TaskUpdate } from '../data/schema'

interface TaskTimelineProps {
  updates: TaskUpdate[]
}

export function TaskTimeline({ updates }: TaskTimelineProps) {
  if (!updates || updates.length === 0) {
    return (
      <p className='py-4 text-center text-sm text-muted-foreground italic'>
        No updates yet.
      </p>
    )
  }

  // Sort newest first
  const sorted = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className='relative space-y-0'>
      {/* Vertical timeline line */}
      <div className='absolute top-0 bottom-0 left-4 w-px bg-border' />

      {sorted.map((update, idx) => {
        const status = statuses.find((s) => s.value === update.status)
        const StatusIcon = status?.icon

        return (
          <div key={update._id ?? idx} className='relative flex gap-4 pb-6'>
            {/* Timeline dot */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                update.status === 'Done'
                  ? 'border-green-500'
                  : update.status === 'In Progress'
                    ? 'border-blue-500'
                    : 'border-gray-400'
              )}
            >
              {StatusIcon && (
                <StatusIcon
                  className={cn(
                    'h-4 w-4',
                    update.status === 'Done'
                      ? 'text-green-600'
                      : update.status === 'In Progress'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className='flex-1 rounded-lg border bg-card p-4 shadow-sm'>
              {/* Header */}
              <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <User className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    {update.updatedBy.name}
                  </span>
                  <Badge
                    variant='outline'
                    className={cn(
                      'text-[10px]',
                      update.status === 'Done' &&
                        'border-green-500 text-green-700',
                      update.status === 'In Progress' &&
                        'border-blue-500 text-blue-700',
                      update.status === 'Todo' &&
                        'border-gray-400 text-gray-700'
                    )}
                  >
                    {update.status}
                  </Badge>
                </div>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='h-3 w-3' />
                  {format(new Date(update.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {/* Remarks */}
              {update.remarks && (
                <p className='mb-3 text-sm text-foreground'>{update.remarks}</p>
              )}

              {/* Attachments */}
              {update.attachments.length > 0 && (
                <div className='mb-2'>
                  <div className='mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                    <Paperclip className='h-3 w-3' />
                    Attachments
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {update.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.driveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs transition-colors hover:bg-accent'
                      >
                        <span className='max-w-[100px] truncate'>
                          {att.originalName}
                        </span>
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice notes */}
              {update.voiceNotes.length > 0 && (
                <div className='mb-2'>
                  <div className='mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                    <Mic className='h-3 w-3' />
                    Voice Notes
                  </div>
                  <div className='space-y-1'>
                    {update.voiceNotes.map((vn, i) => (
                      <a
                        key={i}
                        href={vn.driveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs transition-colors hover:bg-accent'
                      >
                        {vn.originalName}
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Video notes */}
              {update.videoNotes.length > 0 && (
                <div>
                  <div className='mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                    <Video className='h-3 w-3' />
                    Video Notes
                  </div>
                  <div className='space-y-1'>
                    {update.videoNotes.map((vn, i) => (
                      <a
                        key={i}
                        href={vn.driveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs transition-colors hover:bg-accent'
                      >
                        {vn.originalName}
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
