import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { UsersRowActions } from './users-row-actions'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.getValue('name')}</span>
        <span className='truncate text-[10px] text-muted-foreground'>
          {row.original.email}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => <span className='text-xs'>{row.getValue('email')}</span>,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const roleValue = row.getValue('role') as string
      const roleItem = roles.find(({ value }) => value === roleValue)
      return (
        <Badge
          variant='outline'
          className={cn(
            'capitalize',
            roleValue === 'admin'
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-muted-foreground/30'
          )}
        >
          {roleItem?.icon && <roleItem.icon className='mr-1 h-3 w-3' />}
          {roleItem?.label ?? roleValue}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'bio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bio' />
    ),
    cell: ({ row }) => (
      <span className='max-w-48 truncate text-xs text-muted-foreground'>
        {row.getValue('bio') || '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsersRowActions row={row} />,
  },
]
