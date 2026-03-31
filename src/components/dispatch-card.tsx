import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
    Truck, 
    Calendar, 
    MoreVertical, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    Box,
    MapPin,
    Package,
    ArrowRight
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
import { ALL_DISPATCH } from "@/modules/dispatch-invoice/types";

export interface DispatchCardProps {
    dispatch: ALL_DISPATCH;
    onEdit: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onView: (id: string | number) => void;
    className?: string;
}

export function DispatchCard({
    dispatch,
    onEdit,
    onDelete,
    onView,
    className,
}: DispatchCardProps) {
    return (
        <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                        <Truck className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-medium leading-tight line-clamp-2" title={dispatch.customer_name}>
                            {dispatch.customer_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">Note: #{dispatch.dispatch_id}</p>
                    </div>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <DropdownMenuItem onSelect={() => onView(dispatch.dispatch_id)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(dispatch.dispatch_id)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Record
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => onDelete(dispatch.dispatch_id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Record
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 pt-4">
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <Badge className="h-[32px] w-full justify-center rounded-md px-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium">
                        Qty: {dispatch.dispatch_qty}
                    </Badge>
                    <div className="flex items-center justify-center h-[32px] w-full rounded-md px-3 bg-muted border border-border">
                        <StatusBadge status={dispatch.status} type="DISPATCH_INVOICE" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <Package className="h-3.5 w-3.5" /> Bundles
                        </span>
                        <span className="font-semibold text-sm truncate">{dispatch.no_of_bundles} Units</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <Calendar className="h-3.5 w-3.5" /> Date
                        </span>
                        <span className="font-semibold text-sm truncate">
                            {dispatch.dispatch_date ? format(new Date(dispatch.dispatch_date), "dd MMM yyyy") : "N/A"}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4 min-w-0">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <span className="truncate" title={dispatch.delivery_address}>{dispatch.delivery_address}</span>
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Job Reference</span>
                        <span className="font-medium truncate" title={dispatch.job_name}>{dispatch.job_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold shrink-0 ml-4">
                        <span className="text-[12px] uppercase tracking-wider">Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
