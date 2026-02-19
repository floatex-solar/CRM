import { SiteAddDialog } from './site-add-dialog'
import { SiteDeleteDialog } from './site-delete-dialog'
import { SiteEditDialog } from './site-edit-dialog'
import { useSites } from './sites-provider'

export function SitesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSites()

  return (
    <>
      <SiteAddDialog
        key='site-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <SiteEditDialog
            key={`site-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <SiteDeleteDialog
            key={`site-delete-${currentRow._id}`}
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
