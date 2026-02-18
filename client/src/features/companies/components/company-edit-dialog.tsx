import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CompanyForm } from './company-add-form'
import { useUpdateCompanyMutation } from '../hooks/use-companies-api'
import type { Company, CompanyInput } from '../data/schema'

type CompanyEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Company
}

export function CompanyEditDialog({
  open,
  onOpenChange,
  currentRow,
}: CompanyEditDialogProps) {
  const updateMutation = useUpdateCompanyMutation()

  const onSubmit = async (values: CompanyInput) => {
    try {
      await updateMutation.mutateAsync({ id: currentRow._id, input: values })
      toast.success('Company updated successfully.')
      onOpenChange(false)
    } catch {
      // Error handled by mutation onError
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
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the company details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <CompanyForm 
            initialData={currentRow} 
            onSubmit={onSubmit} 
            isPending={updateMutation.isPending} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
