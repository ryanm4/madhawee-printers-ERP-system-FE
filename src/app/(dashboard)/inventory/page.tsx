"use client"
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inventoryApi } from '@/modules/inventory/api'
import { PlusIcon, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DataTable } from './_components/inventory_table'
import { inventoryColumns } from './_components/inventory_columns'
import { GET_ALL_INVENTORY } from '@/modules/inventory/types'
import { AlertDeleteDialog } from '@/components/shared/delete_popup'

function InventoryManagement() {
    const router = useRouter()
    const [data, setData] = useState<GET_ALL_INVENTORY[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await inventoryApi.getAll();
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

    const columns = inventoryColumns({
        onEdit: (id) => {
            router.push(`/inventory/${id}/edit`)
        },
        onDelete: (id) => {
            setDeleteId(id)
        },
    })


    const handleDelete = async () => {
        if (deleteId === null) return;

        try {
            setIsLoading(true);
            await inventoryApi.delete(deleteId);


            await fetchData();

        } catch (error) {
            console.error("Failed to delete inventory item");
        } finally {
            setIsLoading(false);
            setDeleteId(null); // close popup
        }
    };
    return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
                <PageTitleWithBreadcrumb
                    title="Inventory Management"
                    breadcrumbs={[
                        { title: "Dashboard", href: "/dashboard" }
                    ]}
                />
                <div className="flex flex-row justify-end gap-[24px]">
                    <div className="relative w-[320px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Item Name"
                            className="w-full pl-8"
                        />
                    </div>




                    <Button onClick={() => router.push("/inventory/create")}>
                        <PlusIcon /> Create New
                    </Button>
                </div>
                <DataTable
                    columns={columns}
                    data={data}
                />
            </div>

            <AlertDeleteDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                handleSubmit={handleDelete}
            />
        </>


    )
}

export default InventoryManagement