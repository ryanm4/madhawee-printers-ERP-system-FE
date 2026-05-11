import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, MoreHorizontal, PencilIcon, TrashIcon, Download } from "lucide-react"
import { IssueNote } from "@/modules/issue-notes/types"
import { format, parseISO } from "date-fns"

interface IssueNoteTableActions {
    onView: (id: number | string) => void
    onEdit: (id: number | string) => void
    onDelete: (id: number | string) => void
    onDownload: (note: IssueNote) => void
}

export const issueNotesColumns = (
    actions: IssueNoteTableActions
): ColumnDef<IssueNote>[] => [
        {
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Issue ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "date",
            header: "Issued Date",
            cell: ({ row }) => {
                const date = row.original.date
                try {
                    return date ? format(parseISO(date), "PPP") : "-"
                } catch (_e) {
                    return date || "-"
                }
            },
        },
        {
            accessorKey: "job_number",
            header: "Job Number",
        },
        {
            accessorKey: "job_name",
            header: "Job Name",
        },
        {
            accessorKey: "collector_name",
            header: "Collector Name",
        },

        {
            accessorKey: "remarks",
            header: "Remarks",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const note = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => actions.onView(note.id)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => actions.onEdit(note.id)}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => actions.onDownload(note)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => actions.onDelete(note.id)}
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete Note
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
