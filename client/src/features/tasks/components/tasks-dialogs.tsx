import { TaskAddDialog } from './task-add-dialog'
import { TaskDeleteDialog } from './task-delete-dialog'
import { TaskDetailDialog } from './task-detail-dialog'
import { TaskEditDialog } from './task-edit-dialog'
import { useTasks } from './tasks-provider'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()

  return (
    <>
      <TaskAddDialog
        key='task-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <TaskEditDialog
            key={`task-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <TaskDeleteDialog
            key={`task-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <TaskDetailDialog
            key={`task-detail-${currentRow._id}`}
            open={open === 'detail'}
            onOpenChange={() => {
              setOpen('detail')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
