import { useEffect, useState, Fragment } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
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
import { leadStatuses, priorities } from '../data/data'
import {
  companiesQueryOptions,
} from '../hooks/use-companies-api'
import { companiesColumns as columns } from './companies-columns'
import { Mail, Phone, User as UserIcon } from 'lucide-react'

const route = getRouteApi('/_authenticated/companies/')

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
    columnFilters: [
      { columnId: 'leadStatus', searchKey: 'leadStatus', type: 'array' },
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
    ],
  })

  const table = useReactTable({
    data: data ?? [],
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
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by name or ID...'
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
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className='cursor-pointer hover:bg-muted/50 transition-colors'
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
                      <TableCell colSpan={row.getVisibleCells().length} className='p-0'>
                        <div className='px-12 py-6 border-b'>
                          <div className='flex items-center gap-2 mb-4'>
                            <UserIcon className='h-4 w-4 text-primary' />
                            <h4 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                              Contact Persons
                            </h4>
                          </div>
                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {row.original.contacts?.map((contact, idx) => (
                              <div key={idx} className='flex flex-col gap-2 p-4 rounded-lg bg-background border shadow-sm'>
                                <div className='flex items-center justify-between border-b pb-2 mb-2'>
                                  <span className='font-bold text-sm'>{contact.name}</span>
                                  <span className='text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium uppercase'>
                                    {contact.role || 'Other'}
                                  </span>
                                </div>
                                <div className='space-y-1.5'>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                    <UserIcon className='h-3 w-3' />
                                    <span>{contact.designation || 'No Designation'}</span>
                                  </div>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors'>
                                    <Mail className='h-3 w-3' />
                                    <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()}>{contact.email || 'No Email'}</a>
                                  </div>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors'>
                                    <Phone className='h-3 w-3' />
                                    <a href={`tel:${contact.phone}`} onClick={(e) => e.stopPropagation()}>{contact.phone || 'No Phone'}</a>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!row.original.contacts || row.original.contacts.length === 0) && (
                              <div className='col-span-full py-4 text-center text-sm text-muted-foreground italic'>
                                No contact persons registered for this company.
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
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
