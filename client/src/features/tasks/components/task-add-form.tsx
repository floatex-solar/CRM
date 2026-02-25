import { useState, useRef } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X, Paperclip } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { statuses, priorities } from '../data/data'
import { taskInputSchema, type TaskInput, type Task } from '../data/schema'
import {
  useLeadSelectOptions,
  useUserSelectOptions,
} from '../hooks/use-tasks-api'
import { VideoRecorder } from './video-recorder'
import { VoiceRecorder } from './voice-recorder'

interface TaskAddFormProps {
  initialData?: Task | null
  onSubmit: (formData: FormData) => Promise<void>
  isSubmitting?: boolean
}

export function TaskAddForm({
  initialData,
  onSubmit,
  isSubmitting,
}: TaskAddFormProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [selectedWatchers, setSelectedWatchers] = useState<string[]>(
    initialData?.watchers?.map((w) => w._id) ?? []
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: leadOptions = [], isLoading: isLeadsLoading } =
    useLeadSelectOptions()
  const { data: userOptions = [], isLoading: isUsersLoading } =
    useUserSelectOptions()

  const form = useForm<TaskInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(taskInputSchema) as any,
    defaultValues: {
      lead: initialData?.lead?._id ?? '',
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString().split('T')[0]
        : '',
      assignedTo: initialData?.assignedTo?._id ?? '',
      watchers: initialData?.watchers?.map((w) => w._id) ?? [],
      status: (initialData?.status as TaskInput['status']) ?? 'Todo',
      priority: (initialData?.priority as TaskInput['priority']) ?? 'Medium',
    },
  })

  const handleFormSubmit: SubmitHandler<TaskInput> = async (values) => {
    const formData = new FormData()

    // Append text fields
    if (values.lead) formData.append('lead', values.lead)
    formData.append('title', values.title)
    if (values.description) formData.append('description', values.description)
    formData.append('dueDate', values.dueDate)
    formData.append('assignedTo', values.assignedTo)
    formData.append('status', values.status ?? 'Todo')
    formData.append('priority', values.priority)

    // Watchers as JSON array
    formData.append('watchers', JSON.stringify(selectedWatchers))

    // Attachments
    for (const file of attachedFiles) {
      formData.append('attachments', file)
    }

    // Voice note
    if (voiceBlob) {
      formData.append(
        'voiceNote',
        new File([voiceBlob], 'voice-note.webm', { type: voiceBlob.type })
      )
    }

    // Video note
    if (videoBlob) {
      formData.append(
        'videoNote',
        new File([videoBlob], 'video-note.webm', { type: videoBlob.type })
      )
    }

    await onSubmit(formData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleWatcher = (userId: string) => {
    setSelectedWatchers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Form {...form}>
      <form
        id='task-form'
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-6'
      >
        <fieldset disabled={isSubmitting} className='space-y-6'>
          {/* Title */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder='Enter task title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Describe the task...'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Lead + Due Date row */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='lead'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead (Optional)</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select lead'
                    isPending={isLeadsLoading}
                    items={leadOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date *</FormLabel>
                  <FormControl>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Input type='date' {...(field as any)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Assigned To + Priority row */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='assignedTo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To *</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select assignee'
                    isPending={isUsersLoading}
                    items={userOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select priority'
                    items={priorities.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status (only for edit) */}
          {initialData && (
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select status'
                    items={statuses.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Watchers */}
          <div>
            <FormLabel>Watchers</FormLabel>
            <div className='mt-2 flex flex-wrap gap-2'>
              {userOptions.map((user) => {
                const isSelected = selectedWatchers.includes(user.value)
                return (
                  <Badge
                    key={user.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className='cursor-pointer select-none'
                    onClick={() => toggleWatcher(user.value)}
                  >
                    {user.label}
                    {isSelected && <X className='ml-1 h-3 w-3' />}
                  </Badge>
                )
              })}
              {isUsersLoading && (
                <span className='text-xs text-muted-foreground'>
                  Loading users...
                </span>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <FormLabel>Attachments</FormLabel>
            <div className='mt-2 space-y-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                className='gap-x-2'
              >
                <Upload className='h-4 w-4' />
                Upload Files
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*,.pdf'
                onChange={handleFileChange}
                className='hidden'
              />
              {attachedFiles.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {attachedFiles.map((file, idx) => (
                    <Badge key={idx} variant='secondary' className='gap-x-1'>
                      <Paperclip className='h-3 w-3' />
                      <span className='max-w-[120px] truncate'>
                        {file.name}
                      </span>
                      <button
                        type='button'
                        onClick={() => removeFile(idx)}
                        className='ml-1'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Note */}
          <div>
            <FormLabel>Voice Note</FormLabel>
            <div className='mt-2'>
              <VoiceRecorder onRecorded={setVoiceBlob} />
            </div>
          </div>

          {/* Video Note */}
          <div>
            <FormLabel>Video Note</FormLabel>
            <div className='mt-2'>
              <VideoRecorder onRecorded={setVideoBlob} />
            </div>
          </div>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isSubmitting} size='lg'>
              {isSubmitting
                ? 'Saving...'
                : initialData
                  ? 'Update Task'
                  : 'Create Task'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  )
}
