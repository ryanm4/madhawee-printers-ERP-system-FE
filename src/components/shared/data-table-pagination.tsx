"use client"

import { Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.getState().pagination
    const pageCount = table.getPageCount()

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = []
        const showMax = 5

        if (pageCount <= showMax) {
            for (let i = 0; i < pageCount; i++) pages.push(i)
        } else {
            let start = Math.max(0, pageIndex - 2)
            const end = Math.min(pageCount - 1, start + showMax - 1)

            if (end === pageCount - 1) {
                start = Math.max(0, end - showMax + 1)
            }

            for (let i = start; i <= end; i++) pages.push(i)
        }
        return pages
    }

    const pages = getPageNumbers()
    const totalRows = table.getFilteredRowModel().rows.length
    const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
    const lastRow = Math.min(totalRows, (pageIndex + 1) * pageSize)

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-4">
            {/* Which rows are on screen, out of how many */}
            <p className="text-sm text-[#4B5567] tabular-nums">
                {totalRows === 0
                    ? "No records"
                    : <>Showing <span className="font-semibold text-[#14213D]">{firstRow}–{lastRow}</span> of <span className="font-semibold text-[#14213D]">{totalRows}</span></>}
            </p>

            <div className="flex flex-wrap items-center justify-end gap-4 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm whitespace-nowrap text-[#4B5567]">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={`${pageSize}`} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-center text-sm font-medium">
                    Page {pageIndex + 1} of {pageCount}
                </div>

                <Pagination className="w-auto mx-0">
                    <PaginationContent className="gap-1">
                        <PaginationItem>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={(e) => {
                                    e.preventDefault()
                                    table.setPageIndex(0)
                                }}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                    e.preventDefault()
                                    table.previousPage()
                                }}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </PaginationItem>

                        {pages.map((page) => (
                            <PaginationItem key={page}>
                                <Button
                                    variant={pageIndex === page ? "default" : "outline"}
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        table.setPageIndex(page)
                                    }}
                                >
                                    {page + 1}
                                </Button>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                    e.preventDefault()
                                    table.nextPage()
                                }}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={(e) => {
                                    e.preventDefault()
                                    table.setPageIndex(table.getPageCount() - 1)
                                }}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
