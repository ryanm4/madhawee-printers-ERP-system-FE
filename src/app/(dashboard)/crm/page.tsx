"use client"
import PageTitleWithBreadcrumb from "@/common/PageTitileWithBreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { DataTable } from "./data-table";
import { columns, JobTicket } from "./columns";
import { useRouter } from "next/navigation";

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

export default function CRMPage() {
    const router = useRouter();
    const data = getData()
    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Customer Relationship Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" }
                ]}
            />
            <div className="flex flex-row justify-end gap-[24px]">
                <div className="relative w-[320px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Customer"
                        className="w-full pl-8"
                    />
                </div>




                <Button onClick={() => router.push("/crm/create")}>
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
