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
import {
  Droplets,
  ExternalLink,
  FileCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Site } from '../data/schema'
import { sitesQueryOptions } from '../hooks/use-sites-api'
import { sitesColumns as columns } from './sites-columns'

const route = getRouteApi('/_authenticated/sites/')

/** Renders a labeled detail item for the expanded row section. */
function DetailItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-[10px] font-medium tracking-wider text-muted-foreground uppercase'>
        {label}
      </span>
      <span className='text-sm'>{value || '-'}</span>
    </div>
  )
}

/** Renders a boolean flag with an icon for the expanded row section. */
function BooleanFlag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className='flex items-center gap-2'>
      {value ? (
        <CheckCircle2 className='h-3.5 w-3.5 text-green-500' />
      ) : (
        <XCircle className='h-3.5 w-3.5 text-muted-foreground/50' />
      )}
      <span
        className={cn(
          'text-xs',
          value ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  )
}

/** Renders a file link for the expanded row when a file exists. */
function FileLink({
  label,
  file,
}: {
  label: string
  file?: { path: string; originalName: string }
}) {
  if (!file?.path) return null

  const url = file.path.startsWith('http')
    ? file.path
    : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${file.path.split(/[/\\]/).pop()}`

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(e) => e.stopPropagation()}
      className='flex items-center gap-1.5 text-xs text-primary hover:underline'
    >
      <ExternalLink className='h-3 w-3' />
      {label}: {file.originalName}
    </a>
  )
}

/** Renders the expanded detail section for a single site row. */
function SiteExpandedRow({ site }: { site: Site }) {
  return (
    <div className='space-y-6 border-b px-12 py-6'>
      {/* Technical Characteristics */}
      <div>
        <div className='mb-4 flex items-center gap-2'>
          <Droplets className='h-4 w-4 text-primary' />
          <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
            Technical Characteristics
          </h4>
        </div>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          <DetailItem label='Type of Water Body' value={site.typeOfWaterBody} />
          <DetailItem label='Use of Water' value={site.useOfWater} />
          <DetailItem label='Water Area (sqmt)' value={site.waterArea} />
          <DetailItem label='Wind Speed (m/s)' value={site.windSpeed} />
          <DetailItem label='Max Water Level' value={site.maxWaterLevel} />
          <DetailItem
            label='Min Draw Down Level'
            value={site.minDrawDownLevel}
          />
          <DetailItem
            label='Full Reservoir Level'
            value={site.fullReservoirLevel}
          />
          <DetailItem
            label='Water Level Variation'
            value={site.waterLevelVariation ?? ''}
          />
          <DetailItem
            label='Fetch of the Reservoir'
            value={site.fetchOfReservoir ?? ''}
          />
          <DetailItem label='Wave Height' value={site.waveHeight} />
          <DetailItem label='Water Current' value={site.waterCurrent} />
        </div>
      </div>

      {/* Input Data Available */}
      <div>
        <div className='mb-4 flex items-center gap-2'>
          <FileCheck className='h-4 w-4 text-primary' />
          <h4 className='text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
            Input Data Available
          </h4>
        </div>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5'>
          <BooleanFlag
            label='Bathymetry Survey'
            value={site.bathymetryAvailable}
          />
          <BooleanFlag
            label='Geotechnical Report'
            value={site.geotechnicalReportAvailable}
          />
          <BooleanFlag label='PFR' value={site.pfrAvailable} />
          <BooleanFlag label='DPR' value={site.dprAvailable} />
          <BooleanFlag
            label='Pond Getting Empty'
            value={site.possibilityForPondGettingEmpty}
          />
        </div>

        {/* File links */}
        <div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-4'>
          <FileLink label='Bathymetry File' file={site.bathymetryFile} />
          <FileLink label='Geotechnical File' file={site.geotechnicalFile} />
          <FileLink label='PFR File' file={site.pfrFile} />
          <FileLink label='DPR File' file={site.dprFile} />
        </div>
      </div>
    </div>
  )
}

export function SitesTable() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isPending } = useQuery(
    sitesQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      filter: search.filter || undefined,
    })
  )

  const sites = data?.sites ?? []
  const totalCount = data?.totalCount ?? 0
  const pageSize = search.pageSize ?? 10

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

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
  })

  const serverPageCount = Math.ceil(totalCount / pageSize)

  const table = useReactTable({
    data: sites,
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

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar table={table} searchPlaceholder='Filter by name...' />
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
                        <SiteExpandedRow site={row.original} />
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
    </div>
  )
}
