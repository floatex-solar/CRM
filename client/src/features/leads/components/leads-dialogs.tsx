import { LeadAddDialog } from './lead-add-dialog'
import { LeadDeleteDialog } from './lead-delete-dialog'
import { LeadEditDialog } from './lead-edit-dialog'
import { useLeads } from './leads-provider'

export function LeadsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useLeads()

  return (
    <>
      <LeadAddDialog
        key='lead-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <LeadEditDialog
            key={`lead-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <LeadDeleteDialog
            key={`lead-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
