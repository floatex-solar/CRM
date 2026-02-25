import { useEffect, useState, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2, AlertTriangle, FileCheck, ExternalLink } from 'lucide-react'
import { Mail, Phone, User as UserIcon } from 'lucide-react'
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
import { leadStatuses, priorities } from '../data/data'
import {
  companiesQueryOptions,
  useBulkDeleteCompaniesMutation,
} from '../hooks/use-companies-api'
import { companiesColumns as columns } from './companies-columns'

const route = getRouteApi('/_authenticated/companies/')

/** Renders a file link for the expanded row when a file exists. */
function FileLink({ label, url }: { label: string; url?: string }) {
  if (!url) return null

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(e) => e.stopPropagation()}
      className='flex items-center gap-1.5 text-xs text-primary hover:underline'
    >
      <ExternalLink className='h-3 w-3' />
      {label}
    </a>
  )
}

export function CompaniesTable() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isPending } = useQuery(
    companiesQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      leadStatus: search.leadStatus?.length ? search.leadStatus : undefined,
      priority: search.priority?.length ? search.priority : undefined,
      filter: search.filter || undefined,
    })
  )

  const companies = data?.companies ?? []
  const totalCount = data?.totalCount ?? 0
  const pageSize = search.pageSize ?? 10

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const bulkDeleteMutation = useBulkDeleteCompaniesMutation()

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
      { columnId: 'leadStatus', searchKey: 'leadStatus', type: 'array' },
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
    ],
  })

  const serverPageCount = Math.ceil(totalCount / pageSize)

  const table = useReactTable({
    data: companies,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
      expanded,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    pageCount: serverPageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
        `${selectedIds.length} company${selectedIds.length > 1 ? 'ies' : ''} deleted successfully.`
      )
      table.resetRowSelection()
      setIsDeleteDialogOpen(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete companies. Please try again.'
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
        searchPlaceholder='Filter by name...'
        filters={[
          {
            columnId: 'leadStatus',
            title: 'Lead Status',
            options: leadStatuses.map(({ label, value }) => ({ label, value })),
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
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className='cursor-pointer transition-colors hover:bg-muted/50'
                    onClick={() => row.toggleExpanded()}
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
                  {row.getIsExpanded() && (
                    <TableRow className='bg-muted/30'>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className='p-0'
                      >
                        <div className='border-b px-12 py-6'>
                          <div className='mb-4 flex items-center gap-2'>
                            <UserIcon className='h-4 w-4 text-primary' />
                            <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
                              Contact Persons
                            </h4>
                          </div>
                          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {row.original.contacts?.map((contact, idx) => (
                              <div
                                key={idx}
                                className='flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-sm'
                              >
                                <div className='mb-2 flex items-center justify-between border-b pb-2'>
                                  <span className='text-sm font-bold'>
                                    {contact.name}
                                  </span>
                                  <span className='rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase'>
                                    {contact.role || 'Other'}
                                  </span>
                                </div>
                                <div className='space-y-1.5'>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                    <UserIcon className='h-3 w-3' />
                                    <span>
                                      {contact.designation || 'No Designation'}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary'>
                                    <Mail className='h-3 w-3' />
                                    <a
                                      href={`mailto:${contact.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {contact.email || 'No Email'}
                                    </a>
                                  </div>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary'>
                                    <Phone className='h-3 w-3' />
                                    <a
                                      href={`tel:${contact.phone}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {contact.phone || 'No Phone'}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!row.original.contacts ||
                              row.original.contacts.length === 0) && (
                              <div className='col-span-full py-4 text-center text-sm text-muted-foreground italic'>
                                No contact persons registered for this company.
                              </div>
                            )}
                          </div>

                          {(row.original.ndaFileUrl ||
                            row.original.mouFileUrl) && (
                            <div className='mt-6'>
                              <div className='mb-4 flex items-center gap-2'>
                                <FileCheck className='h-4 w-4 text-primary' />
                                <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
                                  Agreements & Documents
                                </h4>
                              </div>
                              <div className='flex items-center gap-6'>
                                <FileLink
                                  label='View NDA Document'
                                  url={row.original.ndaFileUrl}
                                />
                                <FileLink
                                  label='View MOU Document'
                                  url={row.original.mouFileUrl}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
      <DataTableBulkActions table={table} entityName='company'>
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
            <p>Delete selected companies</p>
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
            Delete {selectedIds.length} Company
            {selectedIds.length > 1 ? 'ies' : ''}
          </span>
        }
        desc={
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{selectedIds.length}</span> selected
            company{selectedIds.length > 1 ? 'ies' : ''}?
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
