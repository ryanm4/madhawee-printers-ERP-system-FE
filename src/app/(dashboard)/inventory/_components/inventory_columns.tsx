import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { GET_ALL_INVENTORY } from "@/modules/inventory/types"
import { StatusBadge } from "@/components/shared/status-badge"

interface InventoryTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
}

export const inventoryColumns = (
    actions: InventoryTableActions,
    options?: { canModify?: boolean }
): ColumnDef<GET_ALL_INVENTORY>[] => {
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "item_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Item ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "item_category",
            header: "Item Category",
        },
        {
            accessorKey: "item_sub_category",
            header: "Item Sub Category",
        },
        {
            accessorKey: "item_name",
            header: "Item Name",
        },
        {
            accessorKey: "size",
            id: "size",
            header: "Item Size",
            cell: ({ row }) => row.original.size || "-",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "unit_of_measure",
            header: "Unit of Measure",
        },
        {
            accessorKey: "reorder_level",
            header: "Reorder Point",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <StatusBadge status={status} type="INVENTORY" />
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const inventory = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => actions.onView(inventory.item_id)}
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>

                            {canModify && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => actions.onEdit(inventory.item_id)}
                                    >
                                        <PencilIcon className="mr-2 h-4 w-4" />
                                        Edit Inventory
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => actions.onDelete(inventory.item_id)}
                                    >
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        Delete Inventory
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];
};
