"use client"

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
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { ExportButton } from "@/components/shared/export-button"

import { Loader2 } from "lucide-react"

const RIGHT_ALIGNED_COLUMNS = [
    "Total Sales", "Unit Price", "Revenue", "Rate", "PO Grand Total",
    "Sub Total", "Total Without Tax", "Net Total", "Amount", "Unit Rate",
    "Total Quantity", "Quantity", "Available Qty", "Dispatch Qty", "Order Qty", "Balance Qty"
];

interface ReportsTableProps {
    data: Record<string, unknown>[]
    isLoading?: boolean
}

export function ReportsTable({ data, isLoading = false }: ReportsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        return Object.keys(firstItem).map((key) => {
            const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(key);
            return {
                accessorKey: key,
                header: () => <div className={`capitalize whitespace-nowrap ${isRightAligned ? "text-right" : ""}`}>{key.replace(/_/g, " ")}</div>,
                cell: ({ row }) => {
                const value = row.getValue(key);
                if (value === null || value === undefined) return "-";
                if (typeof value === "boolean") return value ? "Yes" : "No";
                
                // Allow rendering React elements (like bold tags) directly
                if (typeof value === "object" && "$$typeof" in (value as any)) {
                    return (
                        <div className="max-w-[300px] break-words whitespace-pre-wrap text-sm">
                            {value as React.ReactNode}
                        </div>
                    );
                }

                // Globally format ISO date strings to only show the date (yyyy-MM-dd)
                let displayValue = String(value);
                if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    displayValue = value.split("T")[0];
                }

                if (isRightAligned) {
                    return <div className="text-right w-full text-sm">{displayValue}</div>;
                }
                return (
                    <div className="max-w-[300px] break-words whitespace-pre-wrap text-sm">
                        {displayValue}
                    </div>
                );
            },
        }});
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
    })

    if ((!data || data.length === 0) && !isLoading) return null;

    return (
        <div className="space-y-4 max-w-full overflow-hidden">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Report Results</h3>
                <div className="ml-auto flex items-center gap-2">
                    
                    <ExportButton 
                      data={table.getSortedRowModel().rows.map((row) => {
                        const visibleRow: Record<string, any> = {};
                        table.getVisibleFlatColumns().forEach((col) => {
                            // Extract from row.original using the column's id (which maps to the data key)
                            if (col.id !== 'actions') {
                                visibleRow[col.id] = row.original[col.id];
                            }
                        });
                        return visibleRow;
                      })} 
                      filename="report-results" 
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
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
                                            {column.id.replace(/_/g, " ")}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border bg-white overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(header.column.id);
                                        return (
                                        <TableHead key={header.id} className={isRightAligned ? "text-right" : ""}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )})}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length || 1} className="h-24 text-center">
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="ml-2 text-sm text-muted-foreground">Loading report data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(cell.column.id);
                                            return (
                                            <TableCell key={cell.id} className={isRightAligned ? "text-right" : ""}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )})}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length || 1} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <DataTablePagination table={table} key={`${pagination.pageIndex}-${pagination.pageSize}`} />
        </div>
    )
}
