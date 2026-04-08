import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Download, Eye, MoreHorizontal, PencilIcon, Printer, TrashIcon } from "lucide-react"
import { ALL_DISPATCH } from "@/modules/dispatch-invoice/types"
import { StatusBadge } from "@/components/shared/status-badge"

interface DispatchTableActions {
    onEdit: (id: string | number) => void
    onDelete: (id: string | number) => void
    onView: (id: string | number) => void
    onPrint: (dispatch: ALL_DISPATCH) => void
}

export const DispatchColumns = (
    actions: DispatchTableActions
): ColumnDef<ALL_DISPATCH>[] => [
        {
            accessorKey: "dispatch_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Dispatch ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "job_number",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Job Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "job_name",
            header: "Job Name",
        },
        {
            accessorKey: "customer_name",
            header: "Customer Name",
        },
        {
            accessorKey: "job_quantity",
            header: "Job Quantity",
        },
        {
            accessorKey: "dispatch_qty",
            header: "Dispatch Qty",
        },




        {
            accessorKey: "created_by",
            header: "Created By",
        },

        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string | undefined
                return (
                    <StatusBadge status={status || "N/A"} type="DISPATCH_INVOICE" />
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const dispatch = row.original

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"

                            onClick={() => actions.onPrint(dispatch)}
                            title="Print Delivery Note"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>



                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => actions.onView(dispatch.dispatch_id)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Dispatch
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => actions.onEdit(dispatch.dispatch_id)}
                                >
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Edit Dispatch
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => actions.onDelete(dispatch.dispatch_id)}
                                >
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete Dispatch
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]
