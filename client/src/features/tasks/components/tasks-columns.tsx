import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { statuses, priorities } from '../data/data'
import { type Task } from '../data/schema'
import { TasksRowActions } from './tasks-row-actions'

export const tasksColumns: ColumnDef<Task>[] = [
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='max-w-[250px] truncate font-medium'>
          {row.getValue('title')}
        </span>
        {row.original.lead && (
          <span className='text-[10px] tracking-tight text-muted-foreground uppercase'>
            {row.original.lead.jobCode} - {row.original.lead.projectName}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue('status'))
      if (!status) return row.getValue('status')
      const Icon = status.icon
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            status.value === 'Done' &&
              'border border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
            status.value === 'In Progress' &&
              'border border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
            status.value === 'Todo' &&
              'border border-gray-400 bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
          )}
        >
          <Icon className='h-3 w-3' />
          {status.label}
        </span>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
      if (!priority) return row.getValue('priority')
      const Icon = priority.icon
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            priority.value === 'Urgent' && 'text-red-600 dark:text-red-400',
            priority.value === 'High' && 'text-orange-600 dark:text-orange-400',
            priority.value === 'Medium' &&
              'text-yellow-600 dark:text-yellow-400',
            priority.value === 'Low' && 'text-green-600 dark:text-green-400'
          )}
        >
          <Icon className='h-3.5 w-3.5' />
          {priority.label}
        </span>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'assignedTo',
    accessorFn: (row) => row.assignedTo?.name ?? '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned To' />
    ),
    cell: ({ row }) => (
      <span className='text-xs'>{row.original.assignedTo?.name || '-'}</span>
    ),
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('dueDate')
      if (!date) return '-'
      const dueDate = new Date(date as string)
      const isOverdue = dueDate < new Date() && row.original.status !== 'Done'
      return (
        <span
          className={cn(
            'text-xs',
            isOverdue && 'font-semibold text-red-600 dark:text-red-400'
          )}
        >
          {format(dueDate, 'MMM dd, yyyy')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <TasksRowActions row={row} />,
  },
]
