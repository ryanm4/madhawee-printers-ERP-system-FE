import { StatusBadge } from "./shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
    Mail, 
    Phone, 
    MapPin, 
    MoreVertical, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    Building2,
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
import { CUSTOMER } from "@/modules/customer/types";

export interface CustomerCardProps {
    customer: CUSTOMER;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onView: (id: number) => void;
    className?: string;
}

export function CustomerCard({
    customer,
    onEdit,
    onDelete,
    onView,
    className,
}: CustomerCardProps) {
    return (
        <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl uppercase">
                        {customer.company_name?.charAt(0) || <Building2 className="h-6 w-6" />}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-medium leading-tight line-clamp-2" title={customer.company_name}>
                             {customer.company_name}
                         </h3>
                        <p className="text-sm text-muted-foreground truncate">{customer.customer_type}</p>
                    </div>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <DropdownMenuItem onSelect={() => onView(customer.customer_id)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(customer.customer_id)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => onDelete(customer.customer_id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Customer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 pt-4">
                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-3 text-sm min-w-0">
                        <div className="p-2 bg-muted rounded-md shrink-0">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="truncate text-muted-foreground" title={customer.email}>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm min-w-0">
                        <div className="p-2 bg-muted rounded-md shrink-0">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="truncate text-muted-foreground">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm min-w-0">
                        <div className="p-2 bg-muted rounded-md shrink-0">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="truncate text-muted-foreground" title={customer.address}>{customer.address}</span>
                    </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Contact Person</span>
                        <div className="flex items-center gap-2">
                             <User className="h-3 w-3 text-primary" />
                             {(() => {
                                 const contact = Array.isArray(customer.contact_persons) ? customer.contact_persons[0] : null;
                                 const name = contact ? contact.name : (typeof customer.contact_persons === 'string' ? customer.contact_persons : "N/A");
                                 return <span className="font-medium truncate" title={name}>{name || "N/A"}</span>;
                             })()}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4">
                        <span className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">Status</span>
                        <StatusBadge status={customer.status} type="CUSTOMER" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
