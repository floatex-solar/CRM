import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteCompanyMutation } from '../hooks/use-companies-api'
import type { Company } from '../data/schema'

type CompanyDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Company
}

export function CompanyDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CompanyDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteCompanyMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return
    try {
      await deleteMutation.mutateAsync(currentRow._id)
      toast.success('Company deleted successfully.')
      onOpenChange(false)
      setValue('')
    } catch {
      // Error handled by mutation onError
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
          Delete Company
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
            Type the company name to confirm:
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
