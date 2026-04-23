"use client"
import { StatusBadge } from "./shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
    EyeIcon, 
    FileText, 
    MoreVertical, 
    PencilIcon, 
    TrashIcon, 
    Printer,
    DollarSign,
    Calendar,
    User
} from "lucide-react";
import React from "react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { format } from "date-fns";
import { QUOTATIONS } from "@/modules/quotations/types";

export interface QuotationCardProps {
    quotation: QUOTATIONS;
    onEdit: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onDownload: (id: string | number) => void;
    onStatusChange: (id: string | number, status: string) => void;
    className?: string;
}

export function QuotationCard({
    quotation,
    onEdit,
    onDelete,
    onDownload,
    onStatusChange,
    className,
}: QuotationCardProps) {
    return (
        <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-medium leading-tight line-clamp-2" title={quotation.company_name}>
                            {quotation.company_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">Ref: {quotation.quote_id}</p>
                    </div>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <DropdownMenuItem onSelect={() => onEdit(quotation.quote_id)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Quotation
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDownload(quotation.quote_id)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => onDelete(quotation.quote_id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Quotation
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 pt-4">
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <Badge className="h-[32px] w-full justify-center rounded-md px-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium">
                        {quotation.currency} {Number(quotation.net_total).toLocaleString()}
                    </Badge>
                    <div className="flex items-center justify-center h-[32px] w-full rounded-md px-3 bg-muted border border-border">
                        <StatusBadge status={quotation.status} type="QUOTATION" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <User className="h-3.5 w-3.5" /> Contact
                        </span>
                        <span className="font-semibold text-sm truncate" title={quotation.contact_person}>{quotation.contact_person || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <User className="h-3.5 w-3.5" /> Marketing
                        </span>
                        <span className="font-semibold text-sm truncate" title={quotation.marketing_person}>{quotation.marketing_person || "N/A"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <Calendar className="h-3.5 w-3.5" /> Created
                        </span>
                        <span className="font-semibold text-sm truncate">
                            {quotation.created_on ? format(new Date(quotation.created_on), "dd MMM yyyy") : "N/A"}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Items</span>
                        <span className="font-medium">{quotation.no_of_items} Products</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Delivery</span>
                        <span className="font-bold text-amber-600">
                            {quotation.delivery_days} Days
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
