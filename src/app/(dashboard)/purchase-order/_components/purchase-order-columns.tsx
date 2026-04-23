"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, EyeIcon, MoreHorizontal, PencilIcon, TrashIcon, ArrowRightIcon } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"
import { getNextPurchaseOrderStatus } from "@/lib/status-workflow"

interface PurchaseOrderTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onView: (id: number) => void
    onStatusChange: (id: number, status: string) => void
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
            accessorKey: "customer_po",
            header: "PO Number",
            cell: ({ row }) => {
                const po = row.original.customer_po;
                return (
                    <div className="font-semibold" title={po}>
                        {po}
                    </div>
                )
            }
        },
        {
            accessorKey: "customer.name",
            header: "Customer",
            cell: ({ row }) => {
                const name = row.original.customer?.name || "N/A";
                return (
                    <div className="max-w-[180px] truncate" title={name}>
                        {name}
                    </div>
                )
            }
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
                    <StatusBadge status={status || "N/A"} type="PURCHASE_ORDER" />
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

                            {(() => {
                                const nextStatus = getNextPurchaseOrderStatus(po.status);
                                if (nextStatus) {
                                    return (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => actions.onStatusChange(po.po_id, nextStatus)}
                                            >
                                                <ArrowRightIcon className="mr-2 h-4 w-4" />
                                                Update Status to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).toLowerCase()}
                                            </DropdownMenuItem>

                                        </>
                                    );
                                }
                                return null;
                            })()}
                            <DropdownMenuItem
                                onClick={() => actions.onView(po.po_id)}
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View PO
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => actions.onEdit(po.po_id)}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit PO
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => actions.onDelete(po.po_id)}
                                disabled={po.jobs && po.jobs.length > 0}
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
