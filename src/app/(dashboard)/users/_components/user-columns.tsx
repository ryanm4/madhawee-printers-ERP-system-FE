import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"
import { ArrowUpDown } from "lucide-react"
import { GET_ALL_USER } from "@/modules/users/types"

interface UserTableActions {
    onEdit: (user: GET_ALL_USER) => void

}

export const userColumns = (
    actions: UserTableActions
): ColumnDef<GET_ALL_USER>[] => [
        {
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        User ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "name",
            header: "User Name",
        },
        {
            accessorKey: "email",
            header: "User email",
        },
        {
            accessorKey: "user_role",
            header: "User Role",
        },
        {
            accessorKey: "created_on",
            header: "Created On",
        },
        {
            accessorKey: "updated_on",
            header: "Updated On",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => actions.onEdit(user)}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
