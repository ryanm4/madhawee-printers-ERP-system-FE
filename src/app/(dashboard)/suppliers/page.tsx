"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supplierColumns } from "./_components/supplier-columns";

import { SUPPLIER } from "@/modules/supplier/types";
import { SupplierApi } from "@/modules/supplier/api";
import { toast as appToast } from "sonner";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-page";

import { CustomerType } from "@/config/enum";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { DataTable } from "../customers/_components/customer-table";

export default function SuppliersPage() {
    const router = useRouter();
    const [data, setData] = useState<SUPPLIER[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await SupplierApi.getAll();

            if (response.status === 200) {
                // Filter for Suppliers or entities that serve both roles
                const filteredData = response.data.filter(
                    (c: SUPPLIER) =>
                        c.customer_type === CustomerType.SUPPLIER ||
                        c.customer_type === CustomerType.BOTH
                );

                const sortedData = filteredData.sort((a, b) => {
                    const dateA = new Date(a.created_on || (a as Record<string, unknown>).created_at as string || 0).getTime();
                    const dateB = new Date(b.created_on || (b as Record<string, unknown>).created_at as string || 0).getTime();
                    return dateB - dateA;
                });
                setData(sortedData);
            }
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
            appToast.error("Fetch Error", {
                description: "Failed to load supplier data."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlers = {
        onEdit: (id: number) => {
            router.push(`/suppliers/${id}/edit`);
        },
        onDelete: (id: number) => {
            setDeleteId(id);
        },
        onView: (id: number) => {
            router.push(`/suppliers/${id}`);
        },
    };

    const columns = supplierColumns(handlers);

    const handleDelete = async () => {
        if (deleteId === null) return;

        try {
            setIsLoading(true);
            await SupplierApi.delete(deleteId);
            appToast.success("Supplier Deleted", {
                description: "Supplier has been deleted successfully."
            });
            await fetchData();
        } catch (error) {
            console.error("Failed to delete supplier");
            appToast.error("Delete Failed", {
                description: "An error occurred while deleting the supplier."
            });
        } finally {
            setIsLoading(false);
            setDeleteId(null);
        }
    };

    return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
                <PageTitleWithBreadcrumb
                    title="Supplier Management"
                    breadcrumbs={[
                        { title: "Dashboard", href: "/dashboard" },
                    ]}
                />
                <div className="flex flex-row justify-end gap-[24px]">
                    <div className="relative w-[320px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Supplier Name"
                            className="w-full pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ExportButton data={data} filename="suppliers-list" />
                    <Button onClick={() => router.push("/suppliers/create")}>
                        <PlusIcon /> Create New Supplier
                    </Button>
                </div>
                {isLoading ? (
                    <PageLoader />
                ) : data.length === 0 ? (
                    <EmptyState
                        title="No Suppliers Found"
                        description="You haven't added any suppliers yet. Start by creating a new supplier profile."
                        createLabel="Add New Supplier"
                        createPath="/suppliers/create"
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        searchValue={search}
                        searchColumn="company_name"
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
