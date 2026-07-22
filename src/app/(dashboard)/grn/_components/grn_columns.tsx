import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  PencilIcon,
  TrashIcon,
  Printer,
} from "lucide-react";
import { GRN } from "@/modules/grn/types";
import { format, parseISO } from "date-fns";

interface GRNTableActions {
  onView: (id: number | string) => void;
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  onPrint: (grn: GRN) => void;
}

export const grnColumns = (
  actions: GRNTableActions,
  options?: { canModify?: boolean }
): ColumnDef<GRN>[] => {
  const canModify = options?.canModify ?? true;

  return [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GRN ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "releated_po",
    header: "Related PO",
  },
  {
    accessorKey: "received_date",
    header: "Received Date",
    cell: ({ row }) => {
      const date = row.original.received_date;
      try {
        return date ? format(parseISO(date), "PPP") : "-";
      } catch (_e) {
        return date || "-";
      }
    },
  },
  {
    accessorKey: "supplier_name",
    header: "Supplier Name",
  },
  {
    accessorKey: "stock_location",
    header: "Stock Location",
  },
  {
    accessorKey: "payment_method",
    header: "Payment Method",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "supplier_invoice_no",
    header: "Supplier Invoice No",
  },
  {
    accessorKey: "created_on",
    header: "Created On",
    cell: ({ row }) => {
      const date = row.original.created_on;
      try {
        return date ? format(parseISO(date), "PPP") : "-";
      } catch (_e) {
        return date || "-";
      }
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const grn = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => actions.onPrint(grn)}
            title="Print GRN"
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
              <DropdownMenuItem onClick={() => actions.onView(grn.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {canModify && (
                <DropdownMenuItem onClick={() => actions.onEdit(grn.id)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit GRN
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => actions.onPrint(grn)}>
                <Printer className="mr-2 h-4 w-4" />
                Print GRN
              </DropdownMenuItem>
              {canModify && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => actions.onDelete(grn.id)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete GRN
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
};
