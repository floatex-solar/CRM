import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SiteInput } from '../data/schema'
import { useCreateSiteMutation } from '../hooks/use-sites-api'
import { SiteForm } from './site-form'

type SiteAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SiteAddDialog({ open, onOpenChange }: SiteAddDialogProps) {
  const createMutation = useCreateSiteMutation()

  const onSubmit = async (values: SiteInput) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success('Site created successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to create site. Please check the form and try again.'
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
          <DialogTitle>Add Site</DialogTitle>
          <DialogDescription>
            Create a new site. Fill in the details and click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <SiteForm onSubmit={onSubmit} isPending={createMutation.isPending} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
