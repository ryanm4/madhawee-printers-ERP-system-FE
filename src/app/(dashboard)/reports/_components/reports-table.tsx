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
import { RIGHT_ALIGNED_COLUMNS } from "@/lib/report-pdf"

import { ChevronDown, ChevronRight, Layers, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"


interface ReportsTableProps {
    data: Record<string, unknown>[]
    isLoading?: boolean
    filename?: string
    title?: string
    /** e.g. "1 Jan 2026 to 29 Sep 2026"; null for snapshot reports */
    rangeText?: string | null
    grandTotal?: number | null
}

const isTotalRow = (row: Record<string, unknown>) =>
    Object.values(row).some((v) => String(v).toUpperCase() === "TOTAL")

const isEmptyValue = (value: string) => value === "" || value === "-"
const isZeroValue = (value: string) => /^(?:[A-Z]{3}\s)?0(?:\.0+)?$/.test(value.trim())
const isNegativeValue = (value: string) => /^(?:[A-Z]{3}\s)?-\d/.test(value.trim())

const PRESS_BAR = ["#00AEEF", "#EC008C", "#FFDE00", "#231F20"]

export function ReportsTable({
    data,
    isLoading = false,
    filename = "report-results",
    title,
    rangeText,
    grandTotal,
}: ReportsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 25,
    })
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [allExpanded, setAllExpanded] = useState<boolean>(false)

    const recordCount = useMemo(() => data.filter((row) => !isTotalRow(row)).length, [data])

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

                    const totalRow = isTotalRow(row.original);
                    if (value === null || value === undefined || value === "") {
                        return totalRow ? null : <span className="text-muted-foreground/50">-</span>;
                    }
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

                    if (isEmptyValue(displayValue)) {
                        return totalRow ? null : <span className="text-muted-foreground/50">-</span>;
                    }

                    if (isRightAligned) {
                        return (
                            <div
                                className={cn(
                                    "text-right w-full text-sm tabular-nums whitespace-nowrap",
                                    isNegativeValue(displayValue) && "text-red-700 font-medium",
                                    isZeroValue(displayValue) && "text-muted-foreground/60"
                                )}
                            >
                                {displayValue}
                            </div>
                        );
                    }
                    // Short values (sizes, codes, dates) read better on one line; long text wraps
                    return (
                        <div
                            className={cn(
                                "max-w-[300px] text-sm",
                                displayValue.length <= 24 ? "whitespace-nowrap" : "min-w-[200px] break-words whitespace-pre-wrap"
                            )}
                        >
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

    // Export what's on screen: current sort order, visible columns only (job breakdowns kept for PDF/Excel)
    const visibleIds = table.getVisibleLeafColumns().map((c) => c.id)
    const exportRows = table.getSortedRowModel().rows.map((row) => {
        const out: Record<string, unknown> = Object.fromEntries(visibleIds.map((id) => [id, row.original[id]]))
        if (row.original.jobs !== undefined) out.jobs = row.original.jobs
        return out
    })

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
                        <h1 className="text-xl font-bold text-slate-900">{title ?? filename.replace(/_/g, " ")}</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            {rangeText ? `${rangeText}. ` : ""}Generated {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                    </div>
                    <img src="/images/madhawee_logo.svg" alt="Company Logo" className="h-10 object-contain" />
                </div>
            </div>

            <div className="rounded-lg border bg-card overflow-hidden print:border-none print:overflow-visible">
            <div className="grid grid-cols-4 h-[3px] no-print" aria-hidden="true">
                {PRESS_BAR.map((color) => (
                    <span key={color} style={{ backgroundColor: color }} />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 border-b no-print">
                <div>
                    <p className="text-sm font-semibold tabular-nums">
                        {recordCount.toLocaleString()} {recordCount === 1 ? "record" : "records"}
                    </p>
                    <p className="text-xs text-muted-foreground">{rangeText ?? "As of today"}</p>
                </div>
                {grandTotal !== null && grandTotal !== undefined && (
                    <div className="border-l pl-6">
                        <p className="text-xs text-muted-foreground">Total stock value</p>
                        <p className="text-base font-semibold tabular-nums">
                            {new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(grandTotal)}
                        </p>
                    </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                    {hasExpandableJobs && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleExpandAll}
                            className="flex items-center gap-1.5 text-xs h-9"
                        >
                            <Layers className="h-3.5 w-3.5" />
                            {allExpanded ? "Collapse jobs" : "Expand jobs"}
                        </Button>
                    )}
                    <ExportButton
                        data={exportRows}
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

            {/* inline-size containment keeps a wide table from stretching the panel (and its actions) past the screen;
                only this area scrolls sideways */}
            <div className="w-full max-h-[70vh] overflow-auto [contain:inline-size] [&_[data-slot=table-container]]:overflow-visible print:max-h-none print:overflow-visible print:[contain:none]">
                <div className="min-w-full inline-block align-middle">
                    <Table className="print:text-xs print:w-full">
                        <TableHeader className="sticky top-0 z-10 bg-muted shadow-[inset_0_-1px_0_var(--border)] print:static print:bg-slate-100">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isRightAligned = RIGHT_ALIGNED_COLUMNS.includes(header.column.id);
                                        return (
                                            <TableHead key={header.id} className={cn("text-xs font-semibold text-foreground/80", isRightAligned && "text-right")}>
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
                                    const totalRow = isTotalRow(row.original);

                                    return (
                                        <React.Fragment key={row.id}>
                                            <TableRow
                                                className={cn(
                                                    hasJobs && "cursor-pointer hover:bg-slate-50/90 transition-colors",
                                                    isExpanded && "bg-slate-50/80 font-medium",
                                                    totalRow && "bg-muted/70 font-semibold border-t-2 border-t-foreground/15 hover:bg-muted/70 [&_*]:font-semibold"
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

            <div className="no-print border-t px-4 py-2">
                <DataTablePagination table={table} key={`${pagination.pageIndex}-${pagination.pageSize}`} />
            </div>
            </div>
        </div>
    );
}
