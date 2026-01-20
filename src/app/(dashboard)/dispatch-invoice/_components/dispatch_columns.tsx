import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"
import { ALL_DISPATCH } from "@/modules/dispatch-invoice/types"

interface DispatchTableActions {
    onEdit: (id: string | number) => void
    onDelete: (id: string | number) => void
}

export const DispatchColumns = (
    actions: DispatchTableActions
): ColumnDef<ALL_DISPATCH>[] => [
        {
            accessorKey: "dispatch_id",
            header: "Dispatch ID",
        },
        {
            accessorKey: "dispatch_note",
            header: "Dispatch Note",
        },
        {
            accessorKey: "dispatch_qty",
            header: "Dispatch Qty",
        },
        {
            accessorKey: "no_of_bundles",
            header: "No of Bundles",
        },
        {
            accessorKey: "customer_name",
            header: "Customer Name",
        },
        {
            accessorKey: "contact_person",
            header: "Contact Person",
        },
        {
            accessorKey: "job_name",
            header: "Job Name",
        },
        {
            accessorKey: "status",
            header: "Status",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const dispatch = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
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
                )
            },
        },
    ]
