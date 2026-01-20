"use client"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/job-ticket-table";
import { columns, JobTicket, jobTicketColumns } from "./_components/job-ticket-columns";
import { ALL_TICKETS } from "@/modules/job-tickets/types";
import { jobTicketsApi } from "@/modules/job-tickets/api";



function JobTicketComponent() {
    const router = useRouter()
    const [data, setData] = useState<ALL_TICKETS[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
        }
    })
    return (
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
                    />
                </div>




                <Button onClick={() => router.push("/job-ticket/create")}>
                    <PlusIcon /> Create New
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={data}
            />
        </div>
    );
}

export default JobTicketComponent;
