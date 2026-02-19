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
import { Boxes, DollarSign, Anchor, Trash2, AlertTriangle } from 'lucide-react'
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
import { priorities } from '../data/data'
import { type Lead, type DesignConfiguration } from '../data/schema'
import {
  leadsQueryOptions,
  useBulkDeleteLeadsMutation,
} from '../hooks/use-leads-api'
import { leadsColumns as columns } from './leads-columns'

const route = getRouteApi('/_authenticated/leads/')

/* ─────────────────────────────────────────
   Expanded Row Helpers
───────────────────────────────────────── */

/** Renders a labeled detail value. */
function DetailItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div>
      <dt className='text-[10px] font-medium tracking-wider text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd className='mt-0.5 text-sm'>{value || '—'}</dd>
    </div>
  )
}

/** Renders a single design configuration card. */
function DesignConfigCard({ dc }: { dc: DesignConfiguration }) {
  return (
    <div className='rounded-lg border bg-card p-4 shadow-sm'>
      <span className='mb-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary'>
        Version {dc.version ?? '—'}
      </span>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        <DetailItem label='Module Capacity' value={dc.moduleCapacity} />
        <DetailItem label='Module Dimension' value={dc.moduleDimension} />
        <DetailItem label='Inverter Capacity' value={dc.inverterCapacity} />
        <DetailItem label='Inverter Make' value={dc.inverterMake} />
        <DetailItem label='Configuration' value={dc.configuration} />
        <DetailItem label='Anchoring' value={dc.anchoring} />
        <DetailItem label='Type of Anchoring' value={dc.typeOfAnchoring} />
      </div>
    </div>
  )
}

/** Renders the expanded detail section for a single lead row. */
function LeadExpandedRow({ lead }: { lead: Lead }) {
  const currency = lead.currency || ''

  return (
    <div className='space-y-6 border-b px-12 py-6'>
      {/* Design Configurations */}
      {lead.designConfigurations.length > 0 && (
        <div>
          <div className='mb-4 flex items-center gap-2'>
            <Boxes className='h-4 w-4 text-primary' />
            <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
              Design Configurations
            </h4>
          </div>
          <div className='space-y-3'>
            {lead.designConfigurations.map((dc, idx) => (
              <DesignConfigCard key={dc._id ?? idx} dc={dc} />
            ))}
          </div>
        </div>
      )}

      {/* Mooring Technique */}
      {lead.mooringTechnique && (
        <div>
          <div className='mb-4 flex items-center gap-2'>
            <Anchor className='h-4 w-4 text-primary' />
            <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
              Mooring Technique
            </h4>
          </div>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <DetailItem
              label='Type of Mooring'
              value={lead.mooringTechnique.typeOfMooring}
            />
            <DetailItem
              label='Method of Mooring'
              value={lead.mooringTechnique.methodOfMooring}
            />
          </div>
        </div>
      )}

      {/* Offered Price Breakdown */}
      {lead.offeredPrice && (
        <div>
          <div className='mb-4 flex items-center gap-2'>
            <DollarSign className='h-4 w-4 text-primary' />
            <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
              Offered Price Breakdown
              {currency && (
                <span className='ml-2 text-xs font-normal text-muted-foreground'>
                  ({currency})
                </span>
              )}
            </h4>
          </div>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
            <DetailItem
              label='Floating System'
              value={lead.offeredPrice.floatingSystem?.toLocaleString() ?? '—'}
            />
            <DetailItem
              label='Anchoring & Mooring'
              value={
                lead.offeredPrice.anchoringMooringSystem?.toLocaleString() ??
                '—'
              }
            />
            <DetailItem
              label='Supervision'
              value={lead.offeredPrice.supervision?.toLocaleString() ?? '—'}
            />
            <DetailItem
              label='DC Installation'
              value={lead.offeredPrice.dcInstallation?.toLocaleString() ?? '—'}
            />
            <DetailItem
              label='Total'
              value={lead.offeredPrice.total?.toLocaleString() ?? '—'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Table Component
───────────────────────────────────────── */

export function LeadsTable() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isPending } = useQuery(
    leadsQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      priority: search.priority?.length ? search.priority : undefined,
      filter: search.filter || undefined,
    })
  )

  const leads = data?.leads ?? []
  const totalCount = data?.totalCount ?? 0
  const pageSize = search.pageSize ?? 10

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const bulkDeleteMutation = useBulkDeleteLeadsMutation()

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
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
    ],
  })

  const serverPageCount = Math.ceil(totalCount / pageSize)

  const table = useReactTable({
    data: leads,
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
    getExpandedRowModel: getExpandedRowModel(),
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
        `${selectedIds.length} lead${selectedIds.length > 1 ? 's' : ''} deleted successfully.`
      )
      table.resetRowSelection()
      setIsDeleteDialogOpen(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete leads. Please try again.'
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
        searchPlaceholder='Filter by project name...'
        filters={[
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
                    onClick={() => row.toggleExpanded()}
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
                  {row.getIsExpanded() && (
                    <TableRow className='bg-muted/30 hover:bg-muted/30'>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className='p-0'
                      >
                        <LeadExpandedRow lead={row.original} />
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
      <DataTableBulkActions table={table} entityName='lead'>
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
            <p>Delete selected leads</p>
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
            Delete {selectedIds.length} Lead
            {selectedIds.length > 1 ? 's' : ''}
          </span>
        }
        desc={
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{selectedIds.length}</span> selected
            lead{selectedIds.length > 1 ? 's' : ''}?
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
