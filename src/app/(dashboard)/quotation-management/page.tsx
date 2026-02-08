"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb';
import { Input } from '@/components/ui/input';
import { PlusIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QUOTATIONS } from '@/modules/quotations/types';
import { quotationColumns } from './_components/quotation_columns';
import { quotationApi } from '@/modules/quotations/api';
import { DataTable } from './_components/quotation_table';
import { AlertDeleteDialog } from '@/components/shared/delete_popup';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/empty-page';

function QuotationsManagement() {
    const router = useRouter();
    const [data, setData] = useState<QUOTATIONS[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [search, setSearch] = useState("")

    const columns = quotationColumns({
        onEdit: (id) => {
            router.push(`/quotation-management/${id}/edit`)
        },
        onDelete: (id) => {
            setDeleteId(Number(id))
        },
        onDownload(id) {

        },
    })


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await quotationApi.getAll();
            console.log(response)

            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch quotation');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            setLoading(true);
            await quotationApi.delete(deleteId);
            toast("Quotation Deleted", {
                description: `Quotation has been deleted successfully.`,
            })
            await fetchData();
        } catch (error) {
            console.error(error);
            toast("Failed to Delete Quotation", {
                description: "An error occurred while deleting the quotation. Please try again."
            })
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };


    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Quotations Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" }
                ]}
            />
            <div className="flex flex-row justify-end gap-[24px]">
                <div className="relative w-[320px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Quotation Number"
                        className="w-full pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>




                <Button onClick={() => router.push("/quotation-management/create")}>
                    <PlusIcon /> Create New
                </Button>
            </div>
            {data.length === 0 && !loading ? (
                <EmptyState
                    title="No Quotations Yet"
                    description="You haven't created any quotations yet. Get started by creating your first quotation."
                    createLabel="Create New Quotation"
                    createPath="/quotation-management/create"
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    searchValue={search}
                    searchColumn="quote_id"
                />
            )}

            <AlertDeleteDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                handleSubmit={handleDelete}

            />
        </div>
    )
}

export default QuotationsManagement