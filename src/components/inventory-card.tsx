"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
    Box, 
    Layers, 
    MoreVertical, 
    PencilIcon, 
    TrashIcon, 
    AlertTriangle,
    Package,
    Tag
} from "lucide-react";
import React from "react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";

export interface InventoryCardProps {
    item: GET_ALL_INVENTORY;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    className?: string;
}

export function InventoryCard({
    item,
    onEdit,
    onDelete,
    className,
}: InventoryCardProps) {
    const isLowStock = Number(item.quantity) <= Number(item.reorder_level);

    return (
        <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white",
                        isLowStock ? "bg-amber-500" : "bg-primary"
                    )}>
                        <Package className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-medium leading-none tracking-tight truncate" title={item.item_name}>
                            {item.item_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{item.item_category} / {item.item_sub_category}</p>
                    </div>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <DropdownMenuItem onSelect={() => onEdit(item.item_id)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => onDelete(item.item_id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Item
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 pt-4">
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <Badge className={cn(
                        "h-[32px] w-full justify-center rounded-md px-3 text-sm font-medium",
                        isLowStock ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-primary text-white hover:bg-primary/90"
                    )}>
                        {item.quantity} {item.unit_of_measure}
                    </Badge>
                    <Badge variant="secondary" className="h-[32px] w-full justify-center rounded-md px-3 font-medium text-sm bg-muted hover:bg-muted/80 truncate">
                        {item.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <Layers className="h-3.5 w-3.5" /> Size
                        </span>
                        <span className="font-semibold text-sm truncate" title={item.size}>{item.size || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-semibold">
                            <AlertTriangle className="h-3.5 w-3.5" /> Reorder
                        </span>
                        <span className="font-semibold text-sm truncate">
                            {item.reorder_level} {item.unit_of_measure}
                        </span>
                    </div>
                </div>

                {isLowStock && (
                    <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-amber-700 text-xs font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Low stock alert: Consider reordering soon.</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
