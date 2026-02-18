import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { LeadInput } from '../data/schema'
import { useCreateLeadMutation } from '../hooks/use-leads-api'
import { LeadForm } from './lead-form'

type LeadAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadAddDialog({ open, onOpenChange }: LeadAddDialogProps) {
  const createMutation = useCreateLeadMutation()

  const onSubmit = async (values: LeadInput) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success('Lead created successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to create lead. Please check the form and try again.'
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
          <DialogTitle>Add Lead</DialogTitle>
          <DialogDescription>
            Create a new lead. Fill in the details and click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <LeadForm onSubmit={onSubmit} isPending={createMutation.isPending} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
