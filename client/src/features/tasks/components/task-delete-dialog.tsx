import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Task } from '../data/schema'
import { useDeleteTaskMutation } from '../hooks/use-tasks-api'

type TaskDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Task
}

export function TaskDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: TaskDeleteDialogProps) {
  const deleteMutation = useDeleteTaskMutation()

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(currentRow._id)
      toast.success('Task deleted successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete task.'
      toast.error(message)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleConfirm}
      disabled={deleteMutation.isPending}
      className='max-w-md'
      title={`Delete task: "${currentRow.title}"?`}
      desc={
        <>
          You are about to delete the task{' '}
          <strong>&quot;{currentRow.title}&quot;</strong>.<br />
          This action cannot be undone.
        </>
      }
      confirmText='Delete'
      destructive
    />
  )
}
