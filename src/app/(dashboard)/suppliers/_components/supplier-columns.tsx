"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, EyeIcon, MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"
import { SUPPLIER } from "@/modules/supplier/types"

interface SupplierTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
}

export const supplierColumns = (
    actions: SupplierTableActions,
    options?: { canModify?: boolean }
): ColumnDef<SUPPLIER>[] => {
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "company_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Company Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "vat_no",
            header: "VAT Number",
            cell: ({ row }) => row.original.vat_no || "N/A"
        },

        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const supplier = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => actions.onView(supplier.customer_id)}
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Profile
                            </DropdownMenuItem>

                            {canModify && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => actions.onEdit(supplier.customer_id)}
                                    >
                                        <PencilIcon className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => actions.onDelete(supplier.customer_id)}
                                    >
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        Delete Record
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
