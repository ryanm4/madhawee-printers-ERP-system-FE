"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ALL_TICKETS } from "@/modules/job-tickets/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, EyeIcon, MoreHorizontal, PencilIcon, TrashIcon, ArrowRightIcon, Printer } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"
import { getNextJobTicketStatus } from "@/lib/status-workflow"

interface JobTicketTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
    onDownload: (id: number, data: ALL_TICKETS) => void
    onStatusChange: (id: number, status: string) => void
}

export const jobTicketColumns = (
    actions: JobTicketTableActions
): ColumnDef<ALL_TICKETS>[] => [
        {
            accessorKey: "job_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Job ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "job_name",
            header: "Job Name",
            cell: ({ row }) => {
                const name = row.original.job_name;
                return (
                    <div className="max-w-[200px] font-medium leading-tight line-clamp-2" title={name}>
                        {name}
                    </div>
                )
            }
        },
        {
            accessorKey: "customer_po",
            header: "Purchase Order Number",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "job_open_date",
            header: "Job Open Date",
            cell: ({ row }) => {
                const date = row.original.job_open_date

                return date
                    ? format(new Date(date), "dd MMM yyyy")
                    : "-"
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <StatusBadge status={status || "N/A"} type="JOB_TICKET" />
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const job_ticket = row.original
                return (
                    <div className="flex flex-row gap-2 items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {(() => {
                                    const nextStatus = getNextJobTicketStatus(job_ticket.status);
                                    if (nextStatus) {
                                        return (
                                            <DropdownMenuItem
                                                onClick={() => actions.onStatusChange(job_ticket.job_id, nextStatus)}
                                            >
                                                <ArrowRightIcon className="mr-2 h-4 w-4" />
                                                Move Status to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).toLowerCase()}
                                            </DropdownMenuItem>
                                        );
                                    }
                                    return null;
                                })()}
                                <DropdownMenuItem
                                    onClick={() => actions.onView(job_ticket.job_id)}
                                >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    View Job Ticket
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => actions.onEdit(job_ticket.job_id)}
                                >
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Edit Job Ticket
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => actions.onDelete(job_ticket.job_id)}
                                >
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete Job Ticket
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button onClick={() => actions.onDownload(job_ticket.job_id, job_ticket)} variant="outline" size="icon" aria-label="Print">
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]