import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DataTablePagination,
  DataTableToolbar,
  DataTableBulkActions,
} from '@/components/data-table'
import { statuses, priorities } from '../data/data'
import {
  tasksQueryOptions,
  useBulkDeleteTasksMutation,
} from '../hooks/use-tasks-api'
import { tasksColumns as columns } from './tasks-columns'

const route = getRouteApi('/_authenticated/tasks/')

export function TasksTable() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isPending } = useQuery(
    tasksQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      status: search.status?.length ? search.status : undefined,
      priority: search.priority?.length ? search.priority : undefined,
      filter: search.filter || undefined,
    })
  )

  const tasks = data?.tasks ?? []
  const totalCount = data?.totalCount ?? 0
  const pageSize = search.pageSize ?? 10

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const bulkDeleteMutation = useBulkDeleteTasksMutation()

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
    ],
  })

  const serverPageCount = Math.ceil(totalCount / pageSize)

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    pageCount: serverPageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original._id)

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedIds)
      toast.success(
        `${selectedIds.length} task${selectedIds.length > 1 ? 's' : ''} deleted successfully.`
      )
      table.resetRowSelection()
      setIsDeleteDialogOpen(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete tasks. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by title...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses.map(({ label, value }) => ({ label, value })),
          },
          {
            columnId: 'priority',
            title: 'Priority',
            options: priorities.map(({ label, value }) => ({ label, value })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending && !data ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='cursor-pointer transition-colors hover:bg-muted/50'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName,
                        'py-3'
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />

      {/* Bulk actions toolbar */}
      <DataTableBulkActions table={table} entityName='task'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={bulkDeleteMutation.isPending}
              className='gap-x-1'
            >
              <Trash2 className='h-4 w-4' />
              <span className='hidden sm:inline'>Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>

      {/* Bulk delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleConfirm={handleBulkDelete}
        disabled={bulkDeleteMutation.isPending}
        title={
          <span className='text-destructive'>
            <AlertTriangle
              className='me-1 inline-block stroke-destructive'
              size={18}
            />{' '}
            Delete {selectedIds.length} Task{selectedIds.length > 1 ? 's' : ''}
          </span>
        }
        desc={
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{selectedIds.length}</span> selected
            task{selectedIds.length > 1 ? 's' : ''}?
            <br />
            This action cannot be undone.
          </p>
        }
        confirmText='Delete All'
        destructive
      />
    </div>
  )
}
