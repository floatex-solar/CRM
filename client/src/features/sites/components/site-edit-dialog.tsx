import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Site, SiteInput } from '../data/schema'
import { useUpdateSiteMutation } from '../hooks/use-sites-api'
import { SiteForm } from './site-form'

type SiteEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Site
}

export function SiteEditDialog({
  open,
  onOpenChange,
  currentRow,
}: SiteEditDialogProps) {
  const updateMutation = useUpdateSiteMutation()

  const onSubmit = async (values: SiteInput) => {
    try {
      await updateMutation.mutateAsync({ id: currentRow._id, input: values })
      toast.success('Site updated successfully.')
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to update site. Please check the form and try again.'
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
          <DialogTitle>Edit Site</DialogTitle>
          <DialogDescription>
            Update the site details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <SiteForm
            initialData={currentRow}
            onSubmit={onSubmit}
            isPending={updateMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
