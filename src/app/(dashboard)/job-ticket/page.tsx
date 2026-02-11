"use client"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/job-ticket-table";
import { jobTicketColumns } from "./_components/job-ticket-columns";
import { ALL_TICKETS } from "@/modules/job-tickets/types";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { toast } from "sonner";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { EmptyState } from "@/components/shared/empty-page";



function JobTicketComponent() {
    const router = useRouter()
    const [data, setData] = useState<ALL_TICKETS[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await jobTicketsApi.getAll();
            console.log(response)

            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = jobTicketColumns({
        onEdit: (id) => {
            router.push(`/job-ticket/${id}/edit`)
        },
        onDelete: (id) => {
            setDeleteId(id)
        },
        onView: (id) => {
            router.push(`/job-ticket/${id}`)
        },
        onStatusChange: async (id, status) => {
            try {
                setIsLoading(true);
                const currentTicketResponse = await jobTicketsApi.getById(id);
                if (currentTicketResponse.status === 200) {
                    const currentTicket = currentTicketResponse.data as any;

                    // Construct payload matching CREATE_TICKETS interface
                    const payload = {
                        po_id: currentTicket.po_id,
                        item_code: currentTicket.item_code,
                        job_number: currentTicket.job_number,
                        order_received_date: currentTicket.order_received_date,
                        job_open_date: currentTicket.job_open_date,
                        customer_id: currentTicket.customer_id,
                        job_name: currentTicket.job_name,
                        product_type: currentTicket.product_type,
                        quantity: currentTicket.quantity,
                        completed_qty: currentTicket.completed_qty,
                        wastage: currentTicket.wastage,
                        packing_date: currentTicket.packing_date,
                        expiry_date: currentTicket.expiry_date,
                        tc_no: currentTicket.tc_no,
                        batch_ref: currentTicket.batch_ref,
                        remarks: currentTicket.remarks,

                        // Plates
                        old_plates_quantity: currentTicket.old_plates_quantity,
                        old_plates_status: currentTicket.old_plates_status,
                        old_plates_remarks: currentTicket.old_plates_remarks,
                        new_plates_quantity: currentTicket.new_plates_quantity,
                        new_plates_status: currentTicket.new_plates_status,
                        new_plates_remarks: currentTicket.new_plates_remarks,

                        // Map Arrays
                        raw_materials: currentTicket.raw_materials,
                        inks: currentTicket.inks,
                        paperCoating: (currentTicket.paperCoating || currentTicket.paper_coating || []).map((p: any) => ({
                            paper: p.paper || p.paper_type,
                            coating: p.coating,
                            delivery_date: p.delivery_date
                        })),

                        status: status,
                        create_by: currentTicket.create_by || "Admin"
                    };

                    await jobTicketsApi.update(id, payload as any);
                    toast.success(`Job Ticket status updated to ${status}`);
                    await fetchData();
                }
            } catch (error) {
                console.error("Failed to update status", error);
                toast.error("Failed to update status");
            } finally {
                setIsLoading(false);
            }
        }
    })

    const handleDelete = async () => {
        if (deleteId === null) return;

        try {
            setIsLoading(true);
            await jobTicketsApi.delete(deleteId);
            toast("Job Ticket Deleted", {
                description: "Job Ticket has been deleted successfully."
            })
            await fetchData();
        } catch (error) {
            console.error("Failed to delete inventory item");
            toast("Failed to Delete Job Ticket", {
                description: "An error occurred while deleting the job ticket. Please try again."
            })
        } finally {
            setIsLoading(false);
            setDeleteId(null); // close popup
        }
    };
    return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
                <PageTitleWithBreadcrumb
                    title="Job Ticket Management"
                    breadcrumbs={[
                        { title: "Dashboard", href: "/dashboard" }
                    ]}
                />
                <div className="flex flex-row justify-end gap-[24px]">
                    <div className="relative w-[320px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Job Number"
                            className="w-full pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>




                    <Button onClick={() => router.push("/job-ticket/create")}>
                        <PlusIcon /> Create New
                    </Button>
                </div>
                {data.length === 0 && !isLoading ? (
                    <EmptyState
                        title="No Job Tickets"
                        description="You haven't initiated any job tickets yet. Create a job ticket to start the production process."
                        createLabel="Create New Job Ticket"
                        createPath="/job-ticket/create"
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        searchValue={search}
                        searchColumn="job_id"
                    />
                )}
            </div>
            <AlertDeleteDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                handleSubmit={handleDelete}
            />
        </>
    );
}

export default JobTicketComponent;
