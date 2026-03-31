import { StatusBadge } from "./shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
    Barcode, 
    Calendar, 
    EyeIcon, 
    FileText, 
    MoreVertical, 
    PencilIcon, 
    Ticket, 
    TrashIcon, 
    Printer,
    ArrowRightIcon,
    History
} from "lucide-react";
import React, { useState } from "react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { format } from "date-fns";
import { ALL_TICKETS } from "@/modules/job-tickets/types";

export interface JobTicketCardProps {
    ticket: ALL_TICKETS;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onStatusChange: (id: number, status: string) => void;
    className?: string;
}

export function JobTicketCard({
    ticket,
    onEdit,
    onDelete,
    onView,
    onDownload,
    onStatusChange,
    className,
}: JobTicketCardProps) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    return (
        <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Ticket className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-medium leading-tight line-clamp-2" title={ticket.job_name}>
                            {ticket.job_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate" title={ticket.job_number}>{ticket.job_number}</p>
                    </div>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <DropdownMenuItem onSelect={() => onView(ticket.job_id)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(ticket.job_id)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Ticket
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDownload(ticket.job_id)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Ticket
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => onDelete(ticket.job_id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Ticket
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 pt-4">
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <Badge className="h-[32px] w-full justify-center rounded-md px-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium">
                        Qty: {ticket.quantity}
                    </Badge>
                    <div className="flex items-center justify-center h-[32px] w-full rounded-md px-3 bg-muted border border-border">
                        <StatusBadge status={ticket.status} type="JOB_TICKET" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <Barcode className="h-3.5 w-3.5" /> PO Number
                        </span>
                        <span className="font-semibold text-sm truncate" title={ticket.customer_po}>{ticket.customer_po || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <Calendar className="h-3.5 w-3.5" /> Open Date
                        </span>
                        <span className="font-semibold text-sm truncate">
                            {ticket.job_open_date ? format(new Date(ticket.job_open_date), "dd MMM yyyy") : "N/A"}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Product Type</span>
                        <span className="font-medium truncate" title={ticket.product_type}>{ticket.product_type}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Completed</span>
                        <span className={cn(
                            "font-bold",
                            ticket.completed_qty >= ticket.quantity ? "text-green-600" : "text-amber-600"
                        )}>
                            {ticket.completed_qty || 0} / {ticket.quantity}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
