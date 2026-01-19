"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb';
import { Input } from '@/components/ui/input';
import { PlusIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

function QuotationsManagement() {
    const router = useRouter();
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
                    />
                </div>




                <Button onClick={() => router.push("/quotation-management/create")}>
                    <PlusIcon /> Create New
                </Button>
            </div>

        </div>
    )
}

export default QuotationsManagement