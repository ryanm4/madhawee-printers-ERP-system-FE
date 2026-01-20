"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ALL_TICKETS } from "@/modules/job-tickets/types"
import { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"

interface JobTicketTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
}



export const jobTicketColumns = (
    actions: JobTicketTableActions
): ColumnDef<ALL_TICKETS>[] => [
        {
            accessorKey: "job_id",
            header: "Job ID",
        },
        {
            accessorKey: "po_id",
            header: "Purchase Order Number",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "job_open_date",
            header: "Job Open Date",
        },
        {
            accessorKey: "status",
            header: "Status",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const job_ticket = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                )
            },
        },
    ]