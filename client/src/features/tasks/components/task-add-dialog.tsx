import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateTaskMutation } from '../hooks/use-tasks-api'
import { TaskAddForm } from './task-add-form'

type TaskAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskAddDialog({ open, onOpenChange }: TaskAddDialogProps) {
  const createMutation = useCreateTaskMutation()

  const handleSubmit = async (formData: FormData) => {
    try {
      await createMutation.mutateAsync(formData)
      toast.success('Task created successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create task. Please try again.'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new task. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <TaskAddForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
