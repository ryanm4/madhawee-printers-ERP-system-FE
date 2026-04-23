import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { Download, MoreHorizontal, PencilIcon, Printer, TrashIcon, ArrowRightIcon } from "lucide-react"
import { QUOTATIONS } from "@/modules/quotations/types"
import { ArrowUpDown } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge";
import { TaxTypes } from "@/config/enum"
import { format } from "date-fns"
import { getNextQuotationStatus } from "@/lib/status-workflow"

interface QuotationTableActions {
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onDownload: (id: number) => void
    onStatusChange: (id: number, status: string) => void
}

export const quotationColumns = (
    actions: QuotationTableActions
): ColumnDef<QUOTATIONS>[] => [
        {
            accessorKey: "quote_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "company_name",
            header: "Customer Name",
        },
        {
            accessorKey: "customer_address",
            header: "Customer Address",
        },
        {
            accessorKey: "customer_type",
            header: "Customer Type",
        },
        {
            accessorKey: "customer_phone",
            header: "Customer Phone",
        },
        {
            accessorKey: "customer_email",
            header: "Customer Email",
        },
        {
            accessorKey: "type_id",
            header: "Type ID",
        },
        {
            accessorKey: "delivery_days",
            header: "Delivery Days",
        },
        {
            accessorKey: "tax_type_id",
            header: "Tax Type",
            cell: ({ row }) => {
                const taxId = row.original.tax_type_id
                const taxMap: Record<number, TaxTypes> = {
                    0: TaxTypes.VAT,
                    1: TaxTypes.SVAT,
                    2: TaxTypes.NON,
                }
                const taxType = taxMap[taxId] ?? TaxTypes.NON

                return (
                    <StatusBadge status={taxType} type="TAX" />
                )
            }
        },
        {
            accessorKey: "contact_person",
            header: "Contact Person",
        },
        {
            accessorKey: "currency",
            header: "Currency",
        },
        {
            accessorKey: "created_on",
            header: "Created On",
            cell: ({ getValue }) => {
                const value = getValue<string | Date>();

                if (!value) return "-";

                return format(new Date(value), "dd MMM yyyy");
            },
        },
        {
            accessorKey: "created_by",
            header: "Created by",
        },
        {
            accessorKey: "updated_on",
            header: "Updated On",
            cell: ({ getValue }) => {
                const value = getValue<string | Date>();

                if (!value) return "-";

                return format(new Date(value), "dd MMM yyyy");
            },
        },
        {
            accessorKey: "updated_by",
            header: "Updated By",
        },

        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <StatusBadge status={status} type="QUOTATION" />
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const quotation = row.original

                return (
                    <div className="flex flex-row gap-2 items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {(() => {
                                    const nextStatus = getNextQuotationStatus(quotation.status);
                                    if (nextStatus) {
                                        return (
                                            <DropdownMenuItem
                                                onClick={() => actions.onStatusChange(quotation.quote_id, nextStatus)}
                                            >
                                                <ArrowRightIcon className="mr-2 h-4 w-4" />
                                                Update Status to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).toLowerCase()}
                                            </DropdownMenuItem>
                                        );
                                    }
                                    return null;
                                })()}
                                <DropdownMenuItem
                                    onClick={() => actions.onEdit(quotation.quote_id)}
                                >
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Edit Quotation
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => actions.onDelete(quotation.quote_id)}
                                >
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete Quotation
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button onClick={() => actions.onDownload(quotation.quote_id)} variant="outline" size="icon" aria-label="Submit">
                            <Printer />
                        </Button>
                    </div>
                )
            },
        },
    ]
