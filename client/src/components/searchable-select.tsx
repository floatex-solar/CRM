import * as React from 'react'
import {
  Check,
  ChevronsUpDown,
  Loader,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type SelectOption = {
  label: string
  value: string
}

type SearchableSelectProps = {
  value?: string
  onChange?: (val: string) => void
  options: SelectOption[]

  /** CRUD handlers */
  onCreate?: (label: string) => Promise<SelectOption> | SelectOption
  onEdit?: (option: SelectOption) => Promise<SelectOption> | SelectOption
  onDelete?: (value: string) => Promise<void> | void

  /** UI behaviour flags */
  allowCreate?: boolean
  allowEdit?: boolean
  allowDelete?: boolean

  placeholder?: string
  isPending?: boolean
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  value,
  onChange,
  options: initialOptions,

  onCreate,
  onEdit,
  onDelete,

  allowCreate = true,
  allowEdit = true,
  allowDelete = true,

  placeholder = 'Select...',
  isPending,
  disabled,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [options, setOptions] = React.useState<SelectOption[]>(initialOptions)

  const [editing, setEditing] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState('')
  const [deleteTarget, setDeleteTarget] = React.useState<SelectOption | null>(
    null
  )
  const [createConfirm, setCreateConfirm] = React.useState(false)

  const selected = options.find((o) => o.value === value)

  React.useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------- CREATE ---------------- */

  const handleCreate = async () => {
    if (!search.trim()) return

    const newOpt = (await onCreate?.(search)) ?? {
      label: search,
      value: search.toLowerCase(),
    }

    setOptions((prev) => [...prev, newOpt])
    onChange?.(newOpt.value)
    setSearch('')
    setCreateConfirm(false)
    setOpen(false)
  }

  /* ---------------- EDIT ---------------- */

  const handleEdit = async (opt: SelectOption) => {
    const updated = (await onEdit?.({ ...opt, label: editValue })) ?? {
      ...opt,
      label: editValue,
    }

    setOptions((prev) => prev.map((o) => (o.value === opt.value ? updated : o)))

    setEditing(null)
  }

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if (!deleteTarget) return

    await onDelete?.(deleteTarget.value)

    setOptions((prev) => prev.filter((o) => o.value !== deleteTarget.value))

    if (value === deleteTarget.value) {
      onChange?.('')
    }

    setDeleteTarget(null)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            disabled={disabled}
            className={cn('w-full justify-between', className)}
          >
            {selected ? selected.label : placeholder}
            <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-[350px] p-0'>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search...'
              value={search}
              onValueChange={setSearch}
            />

            {isPending && (
              <div className='flex items-center justify-center p-4'>
                <Loader className='h-4 w-4 animate-spin' />
              </div>
            )}

            {/* Create option */}
            {allowCreate && search && filtered.length === 0 && (
              <CommandEmpty>
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => setCreateConfirm(true)}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Create "{search}"
                </Button>
              </CommandEmpty>
            )}

            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  className='flex items-center justify-between'
                >
                  {/* LABEL */}
                  {editing === opt.value ? (
                    <div className='flex w-full gap-2'>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className='h-8'
                      />
                      <Button size='sm' onClick={() => handleEdit(opt)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div
                        className='flex flex-1 cursor-pointer items-center gap-2'
                        onClick={() => {
                          onChange?.(opt.value)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === opt.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {opt.label}
                      </div>

                      {/* ACTION BUTTONS */}
                      {(allowEdit || allowDelete) && (
                        <div className='flex gap-1'>
                          {allowEdit && (
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditing(opt.value)
                                setEditValue(opt.label)
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          )}

                          {allowDelete && (
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTarget(opt)
                              }}
                            >
                              <Trash2 className='h-4 w-4 text-red-500' />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete option?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CREATE CONFIRM */}
      <AlertDialog open={createConfirm} onOpenChange={setCreateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create option?</AlertDialogTitle>
            <AlertDialogDescription>
              "{search}" will be created and selected.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate}>Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
