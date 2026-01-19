"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CUSTOMER } from "@/modules/customer/types"
import { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
interface CustomerTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
}


export const customerColumns = (
    actions: CustomerTableActions
): ColumnDef<CUSTOMER>[] => [
        {
            accessorKey: "customer_id",
            header: "Customer ID",
        },
        {
            accessorKey: "company_name",
            header: "Company Name",
        },
        {
            accessorKey: "customer_type",
            header: "Customer/Supplier",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const customer = row.original
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
                                onClick={() => actions.onView(customer.customer_id)}
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => actions.onEdit(customer.customer_id)}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => actions.onDelete(customer.customer_id)}
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete Customer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]