"use client"

import React, { useMemo, useState } from "react"
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
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { ExportButton } from "@/components/shared/export-button"

import { ChevronDown, ChevronRight, Layers, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const RIGHT_ALIGNED_COLUMNS = [
    "Total Sales", "Unit Price", "Revenue", "Rate", "PO Grand Total",
    "Sub Total", "Total Without Tax", "Net Total", "Amount", "Unit Rate",
    "Total Quantity", "Quantity", "Available Qty", "Dispatch Qty", "Order Qty", "Balance Qty",
    "Stock Value", "Consumed Qty", "Reorder Level", "Total Cost", "Total Amount"
];

interface ReportsTableProps {
    data: Record<string, unknown>[]
    isLoading?: boolean
    filename?: string
}

export function ReportsTable({ data, isLoading = false, filename = "report-results" }: ReportsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [allExpanded, setAllExpanded] = useState<boolean>(false)

    const hasExpandableJobs = useMemo(() => {
        return Array.isArray(data) && data.some((row: any) => Array.isArray(row.jobs) && row.jobs.length > 0);
    }, [data]);

    const toggleRow = (rowId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    const toggleExpandAll = () => {
        if (allExpanded) {
            setExpandedRows({});
            setAllExpanded(false);
        } else {
            const next: Record<string, boolean> = {};
            if (data && data.length > 0) {
                data.forEach((row: any, idx) => {
                    if (Array.isArray(row.jobs) && row.jobs.length > 0) {
                        next[String(idx)] = true;
                    }
                });
            }
            setExpandedRows(next);
            setAllExpanded(true);
        }
    };

    const handlePrint = () => {
        if (hasExpandableJobs) {
            const next: Record<string, boolean> = {};
            data.forEach((row: any, idx) => {
                if (Array.isArray(row.jobs) && row.jobs.length > 0) {
                    next[String(idx)] = true;
                }
            });
            setExpandedRows(next);
            setAllExpanded(true);
        }
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        const keys = Object.keys(firstItem).filter((k) => k !== "jobs");

        return keys.map((key) => {
            const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(key);
            return {
                accessorKey: key,
                header: () => (
                    <div className={`capitalize whitespace-nowrap ${isRightAligned ? "text-right" : ""}`}>
                        {key.replace(/_/g, " ")}
                    </div>
                ),
                cell: ({ row }) => {
                    const value = row.getValue(key);
                    const jobs = Array.isArray(row.original.jobs) ? (row.original.jobs as any[]) : [];
                    const hasJobs = jobs.length > 0;
                    const isExpanded = !!expandedRows[row.id] || allExpanded;

                    if (key === "#") {
                        return (
                            <div className="flex items-center gap-1.5 font-medium">
                                {hasJobs ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 hover:bg-slate-200 text-slate-600 no-print"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleRow(row.id);
                                        }}
                                        title={isExpanded ? "Collapse job breakdown" : "Expand job breakdown"}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-primary" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-500" />
                                        )}
                                    </Button>
                                ) : (
                                    <span className="w-6 inline-block" />
                                )}
                                <span>{String(value ?? "")}</span>
                            </div>
                        );
                    }

                    if (value === null || value === undefined) return "-";
                    if (typeof value === "boolean") return value ? "Yes" : "No";

                    if (typeof value === "object" && "$$typeof" in (value as any)) {
                        return (
                            <div className="max-w-[300px] break-words whitespace-pre-wrap text-sm">
                                {value as React.ReactNode}
                            </div>
                        );
                    }

                    let displayValue = String(value);
                    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                        displayValue = value.split("T")[0];
                    }

                    if (isRightAligned) {
                        return <div className="text-right w-full text-sm font-medium">{displayValue}</div>;
                    }
                    return (
                        <div className="max-w-[300px] break-words whitespace-pre-wrap text-sm">
                            {displayValue}
                        </div>
                    );
                },
            };
        });
    }, [data, expandedRows, allExpanded]);

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
    });

    if ((!data || data.length === 0) && !isLoading) return null;

    return (
        <div className="space-y-4 max-w-full overflow-hidden print:overflow-visible print:m-0 print:p-0">
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 8mm;
                    }
                    body, main {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    header,
                    aside,
                    form,
                    nav,
                    [data-slot="sidebar"],
                    [data-sidebar="sidebar"],
                    [data-slot="sidebar-gap"],
                    [data-slot="sidebar-container"],
                    .no-print {
                        display: none !important;
                    }
                    .print\:block {
                        display: block !important;
                    }
                    .print\:hidden {
                        display: none !important;
                    }
                    .print\:table-row {
                        display: table-row !important;
                    }
                }
            `}</style>
            {/* Print Header */}
            <div className="hidden print:block mb-4 border-b pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 capitalize">{filename.replace(/_/g, " ")}</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Generated on: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    <img src="/images/madhawee_logo.svg" alt="Company Logo" className="h-10 object-contain" />
                </div>
            </div>

            <div className="flex items-center justify-between no-print">
                <h3 className="text-lg font-semibold">Report Results</h3>
                <div className="ml-auto flex items-center gap-2">
                    {hasExpandableJobs && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleExpandAll}
                            className="flex items-center gap-1.5 text-xs h-9"
                        >
                            <Layers className="h-3.5 w-3.5" />
                            {allExpanded ? "Collapse All Jobs" : "Expand All Jobs"}
                        </Button>
                    )}
                    <ExportButton
                        data={table.getSortedRowModel().rows.map((row) => row.original)}
                        filename={filename}
                        onPrint={handlePrint}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9">
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
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id.replace(/_/g, " ")}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-x-auto print:border-none print:shadow-none print:overflow-visible">
                <div className="min-w-full inline-block align-middle">
                    <Table className="print:text-xs print:w-full">
                        <TableHeader className="bg-slate-50 print:bg-slate-100">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(header.column.id);
                                        return (
                                            <TableHead key={header.id} className={isRightAligned ? "text-right" : ""}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
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
                                table.getRowModel().rows.map((row) => {
                                    const jobs = Array.isArray(row.original.jobs) ? (row.original.jobs as any[]) : [];
                                    const hasJobs = jobs.length > 0;
                                    const isExpanded = !!expandedRows[row.id] || allExpanded;

                                    return (
                                        <React.Fragment key={row.id}>
                                            <TableRow
                                                className={cn(
                                                    hasJobs && "cursor-pointer hover:bg-slate-50/90 transition-colors",
                                                    isExpanded && "bg-slate-50/80 font-medium"
                                                )}
                                                onClick={() => {
                                                    if (hasJobs) toggleRow(row.id);
                                                }}
                                            >
                                                {row.getVisibleCells().map((cell) => {
                                                    const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(cell.column.id);
                                                    return (
                                                        <TableCell key={cell.id} className={isRightAligned ? "text-right" : ""}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>

                                            {hasJobs && isExpanded && (
                                                <TableRow className="bg-slate-50/90 hover:bg-slate-50/90 border-b-2 border-primary/20 print:bg-white print:table-row">
                                                    <TableCell colSpan={row.getVisibleCells().length} className="p-3 pl-8 pr-4">
                                                        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-xs space-y-2 print:border-slate-300 print:shadow-none">
                                                            <div className="flex items-center justify-between border-b pb-1.5">
                                                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                                    <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                                                                    Job Consumption Breakdown for:{" "}
                                                                    <span className="text-primary font-bold">{String(row.original["Item Name"] || "")}</span>
                                                                </span>
                                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                                                                    {jobs.length} Job{jobs.length > 1 ? "s" : ""}
                                                                </span>
                                                            </div>

                                                            <Table className="text-xs border rounded-md">
                                                                <TableHeader>
                                                                    <TableRow className="bg-slate-100/90 text-slate-700">
                                                                        <TableHead className="w-10 font-bold">#</TableHead>
                                                                        <TableHead className="font-bold">Job Number</TableHead>
                                                                        <TableHead className="font-bold">Job Name</TableHead>
                                                                        <TableHead className="font-bold">Issue Note #</TableHead>
                                                                        <TableHead className="font-bold">Issue Date</TableHead>
                                                                        <TableHead className="text-right font-bold">Consumed Qty</TableHead>
                                                                        <TableHead className="text-right font-bold">Unit Rate</TableHead>
                                                                        <TableHead className="text-right font-bold">Total Value</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {jobs.map((job: any, jIdx: number) => (
                                                                        <TableRow key={jIdx} className="hover:bg-slate-50">
                                                                            <TableCell className="font-mono text-slate-500">{jIdx + 1}</TableCell>
                                                                            <TableCell className="font-semibold text-primary">{job.job_number || "-"}</TableCell>
                                                                            <TableCell className="font-medium text-slate-800">{job.job_name || "-"}</TableCell>
                                                                            <TableCell className="text-slate-600">{job.issue_note_no || "-"}</TableCell>
                                                                            <TableCell className="text-slate-600">{job.issue_date || "-"}</TableCell>
                                                                            <TableCell className="text-right font-semibold text-slate-900">
                                                                                {typeof job.consumed_qty === "number"
                                                                                    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(job.consumed_qty)
                                                                                    : String(job.consumed_qty || "0")}
                                                                            </TableCell>
                                                                            <TableCell className="text-right text-slate-700">{job.unit_rate || "-"}</TableCell>
                                                                            <TableCell className="text-right font-bold text-primary">{job.total_value || "-"}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
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

            <div className="no-print">
                <DataTablePagination table={table} key={`${pagination.pageIndex}-${pagination.pageSize}`} />
            </div>
        </div>
    );
}
