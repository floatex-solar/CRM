import { type ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Site } from '../data/schema'
import { SitesRowActions } from './sites-row-actions'

export const sitesColumns: ColumnDef<Site>[] = [
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
      <DataTableColumnHeader column={column} title='Site Name' />
    ),
    cell: ({ row }) => (
      <span className='max-w-50 truncate font-medium'>
        {row.getValue('name')}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Owner' />
    ),
    cell: ({ row }) => {
      const owner = row.original.owner
      return (
        <span className='max-w-50 truncate font-medium'>
          {typeof owner === 'object' ? owner.name : owner}
        </span>
      )
    },
  },
  {
    accessorKey: 'country',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Country' />
    ),
    cell: ({ row }) => (
      <span className='truncate'>{row.getValue('country') || '-'}</span>
    ),
  },
  {
    accessorKey: 'locationLat',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lat' />
    ),
    cell: ({ row }) => (
      <span className='text-xs'>
        {Number(row.getValue('locationLat')).toFixed(4)}
      </span>
    ),
  },
  {
    accessorKey: 'locationLng',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lng' />
    ),
    cell: ({ row }) => (
      <span className='text-xs'>
        {Number(row.getValue('locationLng')).toFixed(4)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <SitesRowActions row={row} />,
  },
]
