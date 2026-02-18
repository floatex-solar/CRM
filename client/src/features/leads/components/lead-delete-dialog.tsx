import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Lead } from '../data/schema'
import { useDeleteLeadMutation } from '../hooks/use-leads-api'

type LeadDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Lead
}

export function LeadDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: LeadDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteLeadMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.projectName) return
    try {
      await deleteMutation.mutateAsync(currentRow._id)
      toast.success('Lead deleted successfully.')
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete lead. Please try again.'
      toast.error(message)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={
        value.trim() !== currentRow.projectName || deleteMutation.isPending
      }
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Lead
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.projectName}</span>?
            <br />
            This action cannot be undone.
          </p>
          <Label className='my-2'>
            Type the project name to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter "${currentRow.projectName}" to confirm`}
              className='mt-2'
            />
          </Label>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
