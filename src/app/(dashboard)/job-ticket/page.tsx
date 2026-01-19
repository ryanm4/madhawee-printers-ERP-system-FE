"use client"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { DataTable } from "./_components/job-ticket-table";
import { columns, JobTicket } from "./_components/job-ticket-columns";


async function getData(): Promise<JobTicket[]> {
    // Fetch data from your API here.
    return [
        {
            job_id: "728ed52f",
            quantity: 100,
            status: "pending",
            job_open_date: "m@example.com",
            po_id: "728ed52f",
        },
        // ...
    ]
}

function JobTicketComponent() {
    const router = useRouter()
    const data = getData()
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




                <Button onClick={() => router.push("/purchase-order/create")}>
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
