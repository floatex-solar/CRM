import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Task } from '../data/schema'
import { useUpdateTaskMutation } from '../hooks/use-tasks-api'
import { TaskAddForm } from './task-add-form'

type TaskEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Task
}

export function TaskEditDialog({
  open,
  onOpenChange,
  currentRow,
}: TaskEditDialogProps) {
  const updateMutation = useUpdateTaskMutation()

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateMutation.mutateAsync({ id: currentRow._id, input: formData })
      toast.success('Task updated successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update task. Please try again.'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <TaskAddForm
          initialData={currentRow}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
