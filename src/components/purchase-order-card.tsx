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


export interface Job {
    id: string;
    code: string;
    name: string;
    status: string;
    date: string;
}

export interface PurchaseOrderCardProps {
    companyName: string;
    contactEmail: string;
    poNumber: string;
    poDate: string;
    deliveryDate: string;
    jobs: Job[];
    totalJobs: number;
    additionalJobs: number;
    status: string;
    po_id: string;
    className?: string;
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
                            <DropdownMenuItem onSelect={() => handleClickDelete()} variant="destructive">
                                <TrashIcon />
                                Delete Purchase Order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <Badge className="h-[40px] w-full justify-center rounded-md px-4 bg-black hover:bg-black/90 text-white  text-md font-medium">
                            {totalJobs} Jobs Total
                        </Badge>
                        <Badge className="h-[40px] w-full justify-center rounded-md px-4 bg-black hover:bg-black/90 text-white text-md font-medium">
                            {additionalJobs} Jobs More
                        </Badge>
                        <Badge variant="secondary" className="h-[40px] w-full justify-center rounded-md px-4 font-medium text-md bg-muted hover:bg-muted/80">
                            {status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                PO Number <span className="font-mono tracking-widest text-md"><Barcode className="h-6 w-6" /></span>
                            </span>
                            <span className="font-semibold text-sm">{poNumber}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-md text-muted-foreground flex items-center gap-2">
                                PO Date <Calendar className="h-6 w-6" />
                            </span>
                            <span className="font-semibold text-sm">{poDate}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-md text-muted-foreground flex items-center gap-2">
                                Delivery Date <Truck className="h-6 w-6" />
                            </span>
                            <span className="font-semibold text-sm">{deliveryDate}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">

                                    <Ticket className="h-6 w-6" />

                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[16px] text-muted-foreground line-clamp-1">
                                            {job.code}
                                        </span>
                                        <span className="text-[18px] font-medium leading-none">
                                            {job.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[16px] text-muted-foreground">{job.date}</span>
                                    <span className="text-[18px] font-light text-muted-foreground">{job.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <CreateJobTicketDialog open={isJobTicketOpen} onOpenChange={setIsJobTicketOpen} />
            <AlertDeleteDialog
                isOpen={openDelete}
                onClose={() => setOpenDelete(false)}
                handleSubmit={() => {
                    console.log(`Deleting Purchase Order with ID: ${po_id}`);
                    setOpenDelete(false);
                }}
            />
        </>
    );
}
