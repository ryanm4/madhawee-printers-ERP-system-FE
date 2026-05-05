import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    VisibilityState,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { QUOTATIONS, QuotationItems } from "@/modules/quotations/types"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { utils, writeFile } from "xlsx"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { FileSpreadsheet } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchValue?: string
    searchColumn?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchValue = "",
    searchColumn,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // 🔗 Sync external search with global table filter
    useEffect(() => {
        setGlobalFilter(searchValue)
    }, [searchValue])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            pagination,
        },
    })

    const handleExport = () => {
        // Prepare data for export
        const exportData = data.map((item) => {
            const row = item as Record<string, unknown>;
            return {
                "Job ID": row.job_id,
                "Job Name": row.job_name,
                "Job Number": row.job_number,
                "Job Item": row.job_item,
                "Description": row.description,
                "PO ID": row.po_id,
                "Customer ID": row.customer_id,
                "Product Type": row.product_type,
                "Quantity": row.quantity,
                "Completed Qty": row.completed_qty,
                "Wastage": row.wastage,
                "Status": row.status,
                "Remarks": row.remarks,
                "Job Open Date": row.job_open_date ? format(new Date(row.job_open_date as string), "yyyy-MM-dd") : "",
                "Packing Date": row.packing_date ? format(new Date(row.packing_date as string), "yyyy-MM-dd") : "",
                "Expiry Date": row.expiry_date ? format(new Date(row.expiry_date as string), "yyyy-MM-dd") : "",
                "Old Plate Qty": row.old_plate_quantity,
                "Old Plate Status": row.old_plate_status,
                "Old Plate Remarks": row.old_plate_remarks,
                "New Plate Qty": row.new_plate_quantity,
                "New Plate Status": row.new_plate_status,
                "New Plate Remarks": row.new_plate_remarks,
                "Created By": row.created_by,
                "Created On": row.created_on ? format(new Date(row.created_on as string), "yyyy-MM-dd") : "",
                "Updated By": row.updated_by,
                "Updated On": row.updated_on ? format(new Date(row.updated_on as string), "yyyy-MM-dd") : "",
            };
        });

        // Create worksheet
        const worksheet = utils.json_to_sheet(exportData)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "Job Tickets")

        // Set column widths
        const maxWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || "").length)) + 2
        }))
        worksheet["!cols"] = maxWidths

        // Export file
        const date = format(new Date(), "yyyy-MM-dd")
        writeFile(workbook, `JobTickets_${date}.xlsx`)
    }

    return (
        <div>
            <div className="pb-3 flex gap-2">
                <Button variant="secondary" onClick={handleExport}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as Excel
                </Button>
                <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns
                        </Button>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
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
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} key={`${pagination.pageIndex}-${pagination.pageSize}`} />
        </div>
    )
}