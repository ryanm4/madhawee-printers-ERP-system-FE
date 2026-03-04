"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { userColumns } from './_components/user-columns';
import { userApi } from '@/modules/users/api';
import { GET_ALL_USER } from '@/modules/users/types';
import { Button } from '@/components/ui/button';
import { DataTable } from './_components/user-table';
import { PlusIcon, Search } from 'lucide-react';
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb';
import { Input } from '@/components/ui/input';

function UsersComponent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [data, setData] = useState<GET_ALL_USER[]>([]);


    const columns = userColumns({
        onEdit: (user) => {

            sessionStorage.setItem('editUser', JSON.stringify(user));
            router.push(`/users/${user.id}/edit`);
        }
    });
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();


            if (response.status === 200) {

                setData(response?.data?.users);
            }
        } catch (error) {
            console.error('Failed to fetch quotation');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="User Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" }
                ]}
            />
            <div className="flex flex-row justify-end gap-[24px]">
                <div className="relative w-[320px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search User"
                        className="w-full pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>




                <Button onClick={() => router.push("/users/create")}>
                    <PlusIcon /> Create New
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={data}
                searchValue={search}
                searchColumn="quote_id"
            />


        </div>
    )
}

export default UsersComponent