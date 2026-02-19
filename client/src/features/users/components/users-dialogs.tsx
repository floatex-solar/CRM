import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../hooks/use-users-api'
import { UserForm } from './user-form'
import { useUsers } from './users-provider'

/* ─── Add Dialog ─── */

export function UserAddDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreateUserMutation()

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync(data as any)
      toast.success('User created successfully.')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create user.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with their information.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh]'>
          <div className='px-6 pb-6'>
            <UserForm
              onSubmit={handleSubmit as any}
              isPending={createMutation.isPending}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Edit Dialog ─── */

export function UserEditDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}) {
  const updateMutation = useUpdateUserMutation()

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await updateMutation.mutateAsync({
        id: currentRow._id,
        input: data as any,
      })
      toast.success('User updated successfully.')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details for {currentRow.name}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh]'>
          <div className='px-6 pb-6'>
            <UserForm
              initialData={currentRow}
              onSubmit={handleSubmit as any}
              isPending={updateMutation.isPending}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Delete Dialog ─── */

export function UserDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}) {
  const deleteMutation = useDeleteUserMutation()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(currentRow._id)
      toast.success('User deleted successfully.')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user.')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <p>
          Are you sure you want to delete{' '}
          <span className='font-bold'>{currentRow.name}</span>?
          <br />
          This action cannot be undone.
        </p>
      }
      confirmText='Delete'
      destructive
    />
  )
}

/* ─── Aggregator (used by provider) ─── */

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UserAddDialog
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <UserEditDialog
            key={`user-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
          <UserDeleteDialog
            key={`user-delete-${currentRow._id}`}
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
