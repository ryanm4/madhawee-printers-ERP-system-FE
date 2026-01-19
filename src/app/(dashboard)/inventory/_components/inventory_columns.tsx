import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"
import { GET_ALL_INVENTORY } from "@/modules/inventory/types"

interface InventoryTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

export const inventoryColumns = (
    actions: InventoryTableActions
): ColumnDef<GET_ALL_INVENTORY>[] => [
        {
            accessorKey: "item_id",
            header: "Item ID",
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
            header: "Item Size",
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
