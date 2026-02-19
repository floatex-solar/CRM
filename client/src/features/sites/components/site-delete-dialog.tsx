import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Site } from '../data/schema'
import { useDeleteSiteMutation } from '../hooks/use-sites-api'

type SiteDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Site
}

export function SiteDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: SiteDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteSiteMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return
    try {
      await deleteMutation.mutateAsync(currentRow._id)
      toast.success('Site deleted successfully.')
      onOpenChange(false)
      setValue('')
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete site. Please try again.'
      toast.error(message)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Site
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action cannot be undone.
          </p>
          <Label className='my-2'>
            Type the site name to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter "${currentRow.name}" to confirm`}
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
