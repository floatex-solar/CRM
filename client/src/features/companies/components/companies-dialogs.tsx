import { CompanyAddDialog } from './company-add-dialog'
import { CompanyEditDialog } from './company-edit-dialog'
import { CompanyDeleteDialog } from './company-delete-dialog'
import { useCompanies } from './companies-provider'

export function CompaniesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCompanies()

  return (
    <>
      <CompanyAddDialog
        key='company-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <CompanyEditDialog
            key={`company-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <CompanyDeleteDialog
            key={`company-delete-${currentRow._id}`}
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
