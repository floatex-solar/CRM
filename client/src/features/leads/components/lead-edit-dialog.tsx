import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Lead, LeadInput } from '../data/schema'
import { useUpdateLeadMutation } from '../hooks/use-leads-api'
import { LeadForm } from './lead-form'

type LeadEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Lead
}

export function LeadEditDialog({
  open,
  onOpenChange,
  currentRow,
}: LeadEditDialogProps) {
  const updateMutation = useUpdateLeadMutation()

  const onSubmit = async (values: LeadInput) => {
    try {
      await updateMutation.mutateAsync({ id: currentRow._id, input: values })
      toast.success('Lead updated successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to update lead. Please check the form and try again.'
      toast.error(message)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-7xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update the lead details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <LeadForm
            initialData={currentRow}
            onSubmit={onSubmit}
            isPending={updateMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
