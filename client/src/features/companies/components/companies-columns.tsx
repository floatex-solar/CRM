import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { leadStatuses, priorities } from '../data/data'
import { type Company } from '../data/schema'
import { CompaniesRowActions } from './companies-row-actions'

export const companiesColumns: ColumnDef<Company>[] = [
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
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: '_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px] truncate font-mono text-xs'>
        {String(row.getValue('_id')).slice(-8)}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    meta: {
      className: 'ps-1 max-w-0 w-2/3',
      tdClassName: 'ps-4',
    },
    cell: ({ row }) => {
      const company = row.original
      const categoryLabels = (company.categories ?? []).slice(0, 2)
      return (
        <div className='flex flex-col gap-1'>
          <span className='truncate font-medium'>{company.name}</span>
          {categoryLabels.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {categoryLabels.map((cat) => (
                <Badge key={cat} variant='outline' className='text-xs'>
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'industry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Industry' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.getValue('industry') || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'leadStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lead Status' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const status = leadStatuses.find(
        (s) => s.value === row.getValue('leadStatus')
      )
      if (!status) return <span className='text-muted-foreground'>-</span>
      return <span>{status.label}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-3' },
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue('priority')
      )
      if (!priority) return <span className='text-muted-foreground'>-</span>
      return <span>{priority.label}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'website',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Website' />
    ),
    cell: ({ row }) => {
      const url = row.getValue('website') as string | undefined
      if (!url) return <span className='text-muted-foreground'>-</span>
      return (
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:underline truncate max-w-[120px] block'
        >
          {url}
        </a>
      )
    },
  },
  {
    id: 'contacts',
    accessorFn: (row) =>
      row.contacts?.map((c) => c.name).join(', ') ?? '',
    header: 'Contacts',
    cell: ({ row }) => {
      const contacts = row.original.contacts ?? []
      if (contacts.length === 0)
        return <span className='text-muted-foreground'>-</span>
      return (
        <span className='truncate max-w-[150px] block' title={contacts.map((c) => c.name).join(', ')}>
          {contacts[0]?.name}
          {contacts.length > 1 && ` +${contacts.length - 1}`}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CompaniesRowActions row={row} />,
  },
]
