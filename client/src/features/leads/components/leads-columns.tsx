import { type ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { priorities } from '../data/data'
import { type Lead } from '../data/schema'
import { LeadsRowActions } from './leads-row-actions'

/** Extracts company name from a populated ref or raw string. */
function companyName(ref: Lead['client']): string {
  if (!ref) return '-'
  if (typeof ref === 'string') return ref
  return ref.name
}

export const leadsColumns: ColumnDef<Lead>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
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
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: 'jobCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Job Code' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-medium'>
        {row.getValue('jobCode') || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue('priority')
      )
      const colorMap: Record<string, string> = {
        High: 'border-red-500 text-red-600 bg-red-50',
        Medium: 'border-yellow-500 text-yellow-600 bg-yellow-50',
        Low: 'border-green-500 text-green-600 bg-green-50',
      }
      const color = colorMap[row.getValue('priority') as string] ?? ''
      return (
        <span
          className={cn(
            'rounded border px-1.5 py-0.5 text-[10px] font-semibold',
            color
          )}
        >
          {priority?.label || row.getValue('priority') || '-'}
        </span>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'projectName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Project Name' />
    ),
    cell: ({ row }) => (
      <span className='max-w-[200px] truncate font-medium'>
        {row.getValue('projectName')}
      </span>
    ),
  },
  {
    accessorKey: 'projectLocation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Location' />
    ),
    cell: ({ row }) => (
      <span className='truncate text-xs'>
        {row.getValue('projectLocation') || '-'}
      </span>
    ),
  },
  {
    id: 'client',
    accessorFn: (row) => companyName(row.client),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => (
      <span className='truncate text-xs'>{row.getValue('client')}</span>
    ),
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Capacity' />
    ),
    cell: ({ row }) => (
      <span className='text-xs'>{row.getValue('capacity') || '-'}</span>
    ),
  },
  {
    id: 'developer',
    accessorFn: (row) => companyName(row.developer),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Developer' />
    ),
    cell: ({ row }) => (
      <span className='truncate text-xs'>{row.getValue('developer')}</span>
    ),
  },
  {
    id: 'consultant',
    accessorFn: (row) => companyName(row.consultant),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Consultant' />
    ),
    cell: ({ row }) => (
      <span className='truncate text-xs'>{row.getValue('consultant')}</span>
    ),
  },
  {
    id: 'endCustomer',
    accessorFn: (row) => companyName(row.endCustomer),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='End Customer' />
    ),
    cell: ({ row }) => (
      <span className='truncate text-xs'>{row.getValue('endCustomer')}</span>
    ),
  },
  {
    accessorKey: 'country',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Country' />
    ),
    cell: ({ row }) => (
      <span className='text-xs'>{row.getValue('country') || '-'}</span>
    ),
  },
  {
    id: 'totalOfferedPrice',
    accessorFn: (row) => row.offeredPrice?.total ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Price' />
    ),
    cell: ({ row }) => {
      const total = row.getValue('totalOfferedPrice') as number
      const currency = row.original.currency || ''
      return (
        <span className='text-xs font-medium tabular-nums'>
          {total ? `${currency} ${total.toLocaleString()}` : '-'}
        </span>
      )
    },
  },
  {
    accessorKey: 'responsiblePerson',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Responsible' />
    ),
    cell: ({ row }) => (
      <span className='text-xs'>
        {row.getValue('responsiblePerson') || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <LeadsRowActions row={row} />,
  },
]
