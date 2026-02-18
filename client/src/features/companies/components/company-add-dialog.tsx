import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CompanyForm } from './company-add-form'
import { useCreateCompanyMutation } from '../hooks/use-companies-api'
import type { CompanyInput } from '../data/schema'

type CompanyAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyAddDialog({
  open,
  onOpenChange,
}: CompanyAddDialogProps) {
  const createMutation = useCreateCompanyMutation()

  const onSubmit = async (values: CompanyInput) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success('Company created successfully.')
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
          <DialogTitle>Add Company</DialogTitle>
          <DialogDescription>
            Create a new company. Fill in the details and click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <CompanyForm onSubmit={onSubmit} isPending={createMutation.isPending} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
