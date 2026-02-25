import { useState, useRef } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X, Paperclip, Send } from 'lucide-react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { statuses } from '../data/data'
import {
  taskStatusUpdateInputSchema,
  type TaskStatusUpdateInput,
} from '../data/schema'
import { useAddTaskUpdateMutation } from '../hooks/use-tasks-api'
import { VideoRecorder } from './video-recorder'
import { VoiceRecorder } from './voice-recorder'

interface TaskUpdateFormProps {
  taskId: string
  currentStatus: string
}

export function TaskUpdateForm({ taskId, currentStatus }: TaskUpdateFormProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addUpdateMutation = useAddTaskUpdateMutation()

  const form = useForm<TaskStatusUpdateInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(taskStatusUpdateInputSchema) as any,
    defaultValues: {
      status: currentStatus as TaskStatusUpdateInput['status'],
      remarks: '',
    },
  })

  const handleSubmit: SubmitHandler<TaskStatusUpdateInput> = async (values) => {
    const formData = new FormData()
    formData.append('status', values.status)
    if (values.remarks) formData.append('remarks', values.remarks)

    for (const file of attachedFiles) {
      formData.append('attachments', file)
    }

    if (voiceBlob) {
      formData.append(
        'voiceNote',
        new File([voiceBlob], 'voice-note.webm', { type: voiceBlob.type })
      )
    }

    if (videoBlob) {
      formData.append(
        'videoNote',
        new File([videoBlob], 'video-note.webm', { type: videoBlob.type })
      )
    }

    try {
      await addUpdateMutation.mutateAsync({ taskId, formData })
      toast.success('Task updated successfully.')
      form.reset({ status: values.status, remarks: '' })
      setAttachedFiles([])
      setVoiceBlob(null)
      setVideoBlob(null)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update task.'
      toast.error(message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 rounded-lg border bg-muted/20 p-4'
      >
        <h4 className='text-sm font-semibold'>Post an Update</h4>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
        </div>

        <FormField
          control={form.control}
          name='remarks'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Add your remarks...'
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attachments */}
        <div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            className='gap-x-2'
          >
            <Upload className='h-4 w-4' />
            Attach Files
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
            <div className='mt-2 flex flex-wrap gap-2'>
              {attachedFiles.map((file, idx) => (
                <Badge key={idx} variant='secondary' className='gap-x-1'>
                  <Paperclip className='h-3 w-3' />
                  <span className='max-w-[100px] truncate'>{file.name}</span>
                  <button type='button' onClick={() => removeFile(idx)}>
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Voice & Video */}
        <div className='grid grid-cols-1 gap-4'>
          <VoiceRecorder onRecorded={setVoiceBlob} />
          <VideoRecorder onRecorded={setVideoBlob} />
        </div>

        <div className='flex justify-end'>
          <Button
            type='submit'
            size='sm'
            disabled={addUpdateMutation.isPending}
            className='gap-x-1'
          >
            <Send className='h-4 w-4' />
            {addUpdateMutation.isPending ? 'Posting...' : 'Post Update'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
