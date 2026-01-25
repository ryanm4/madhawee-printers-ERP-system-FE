"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, EyeIcon, MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface PurchaseOrderTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
}

export const purchaseOrderColumns = (
    actions: PurchaseOrderTableActions
): ColumnDef<PURCHASE_ORDER>[] => [
        {
            accessorKey: "po_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        PO ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "customer.name",
            header: "Customer",
        },
        {
            accessorKey: "po_date",
            header: "PO Date",
            cell: ({ row }) => {
                const date = row.original.po_date
                return date ? format(new Date(date), "PPP") : "N/A"
            }
        },
        {
            accessorKey: "delivery_date",
            header: "Delivery Date",
            cell: ({ row }) => {
                const date = row.original.delivery_date
                return date ? format(new Date(date), "PPP") : "N/A"
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge
                        className={`uppercase ${status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                "bg-blue-100 text-blue-800"
                            } px-2 py-1 rounded-md text-sm font-medium`}
                    >
                        {status || "N/A"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const po = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => actions.onView(po.po_id)}
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View PO
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => actions.onEdit(po.po_id)}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit PO
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => actions.onDelete(po.po_id)}
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete PO
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
