import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { leadStatuses, priorities } from '../data/data'
import { type Company } from '../data/schema'
import { CompaniesRowActions } from './companies-row-actions'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const companiesColumns: ColumnDef<Company>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          className='flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent'
        >
          {row.getIsExpanded() ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </button>
      )
    },
  },
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company Name' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='max-w-[150px] truncate font-medium'>
          {row.getValue('name')}
        </span>
        <span className='text-[10px] text-muted-foreground uppercase tracking-tight'>
          {row.original.typeOfCompany || 'Unknown Type'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'industry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Industry' />
    ),
    cell: ({ row }) => <span className='truncate'>{row.getValue('industry') || '-'}</span>,
  },
  {
    accessorKey: 'leadStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = leadStatuses.find((s) => s.value === row.getValue('leadStatus'))
      return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground')}>{status?.label || row.getValue('leadStatus')}</span>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = priorities.find((p) => p.value === row.getValue('priority'))
      return <span className='text-xs font-medium'>{priority?.label || row.getValue('priority')}</span>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'leadSource',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source' />
    ),
    cell: ({ row }) => <span className='text-xs'>{row.getValue('leadSource') || '-'}</span>,
  },
  {
    accessorKey: 'whoBrought',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Brought By' />
    ),
    cell: ({ row }) => <span className='text-xs'>{row.getValue('whoBrought') || '-'}</span>,
  },
  {
    accessorKey: 'ndaStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='NDA' />
    ),
    cell: ({ row }) => (
      <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-semibold', row.original.ndaStatus === 'Signed' ? 'border-green-500 text-green-600 bg-green-50' : 'border-orange-500 text-orange-600 bg-orange-50')}>
        {row.original.ndaStatus || 'Not Sent'}
      </span>
    ),
  },
  {
    accessorKey: 'mouStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MOU' />
    ),
    cell: ({ row }) => (
      <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-semibold', row.original.mouStatus === 'Signed' ? 'border-green-500 text-green-600 bg-green-50' : 'border-orange-500 text-orange-600 bg-orange-50')}>
        {row.original.mouStatus || 'Not Sent'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CompaniesRowActions row={row} />,
  },
]
