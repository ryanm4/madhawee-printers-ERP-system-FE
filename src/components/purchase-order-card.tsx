"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Barcode, Calendar, DeleteIcon, EyeIcon, FileText, MoreVertical, PencilIcon, PlusIcon, Ticket, TrashIcon, Truck } from "lucide-react";
import React, { useState } from "react";
import { CreateJobTicketDialog } from "../app/(dashboard)/job-ticket/_components/create-job-ticket-dialog";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { useRouter } from "next/navigation";
import { PURCHASE_ORDER_JOBS } from "@/modules/purchase-order/types";
import { format } from "date-fns"



export interface PurchaseOrderCardProps {
    companyName: string;
    contactEmail: string;
    poNumber: number;
    poDate: Date;
    deliveryDate: Date;
    jobs: PURCHASE_ORDER_JOBS[];
    totalJobs: number;
    additionalJobs: number;
    status: string;
    po_id: number;
    className?: string;
    onDelete: (id: number) => Promise<void>;
    onRefresh?: () => Promise<void>;
}

export function PurchaseOrderCard({
    companyName,
    contactEmail,
    poNumber,
    poDate,
    deliveryDate,
    jobs,
    totalJobs,
    additionalJobs,
    status,
    po_id,
    className,
    onDelete,
    onRefresh,
}: PurchaseOrderCardProps) {
    const [isJobTicketOpen, setIsJobTicketOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const router = useRouter();
    const handleClickDelete = () => {
        setOpenDelete(true);
    };

    const handleEditClick = () => {

        router.push(`/purchase-order/${po_id}/edit`);
    };

    const handleViewClick = () => {

        router.push(`/purchase-order/${po_id}/view`);
    };


    return (
        <>
            <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col", className)}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="font-medium  leading-none tracking-tight">
                                {companyName}
                            </h3>
                            <p className="text-sm text-extralight">{contactEmail}</p>
                        </div>
                    </div>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]" align="end">
                            <DropdownMenuItem onSelect={() => setIsJobTicketOpen(true)}>
                                <PlusIcon />
                                Create Job Ticket
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => handleEditClick()}>
                                <PencilIcon />
                                Edit Purchase Order
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => handleViewClick()}>
                                <EyeIcon />
                                View Purchase Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => handleClickDelete()}
                                variant="destructive"
                                disabled={jobs && jobs.length > 0}
                            >
                                <TrashIcon />
                                Delete Purchase Order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <Badge className="h-[40px] w-full justify-center rounded-md px-4 bg-primary hover:bg-primary/90 text-white  text-md font-medium">
                            {totalJobs} Jobs Total
                        </Badge>
                        <Badge className="h-[40px] w-full justify-center rounded-md px-4 bg-primary hover:bg-primary/90 text-white text-md font-medium">
                            {additionalJobs} Jobs More
                        </Badge>
                        <Badge variant="secondary" className="h-[40px] w-full justify-center rounded-md px-4 font-medium text-md bg-muted hover:bg-muted/80">
                            {status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                PO Number <span className="font-mono tracking-widest text-md"><Barcode className="h-5 w-5" /></span>
                            </span>
                            <span className="font-semibold text-sm">{poNumber}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-md text-muted-foreground flex items-center gap-2">
                                PO Date <Calendar className="h-5 w-5" />
                            </span>
                            <span className="font-semibold text-sm">{new Date(poDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-md text-muted-foreground flex items-center gap-2">
                                Delivery Date <Truck className="h-5 w-5" />
                            </span>
                            <span className="font-semibold text-sm">{new Date(deliveryDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {jobs.slice(0, 2).map((job) => (
                            <div key={job.job_id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">

                                    <Ticket className="h-8 w-8" />

                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[14px] text-muted-foreground line-clamp-1">
                                            {job.job_id}
                                        </span>
                                        <span className="text-[16px] font-medium leading-none">
                                            {job.job_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[14px] text-muted-foreground">{format(new Date(job.job_open_date), "dd MMM yyyy")}</span>
                                    <span className="text-[18px] font-light text-muted-foreground">{job.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <CreateJobTicketDialog open={isJobTicketOpen} onOpenChange={setIsJobTicketOpen} initialPoId={String(po_id)} onSuccess={onRefresh} />
            <AlertDeleteDialog
                isOpen={openDelete}
                onClose={() => setOpenDelete(false)}
                handleSubmit={async () => {
                    await onDelete(po_id);
                    setOpenDelete(false);
                }}
            />
        </>
    );
}
