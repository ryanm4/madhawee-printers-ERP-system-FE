"use client"
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

function DispatchInvoiceManagement() {
    const router = useRouter();
    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Dispatch and Invoice Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" }
                ]}
            />
            <div className="flex flex-row justify-end gap-[24px]">
                <div className="relative w-[320px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Dispatch"
                        className="w-full pl-8"
                    />
                </div>




                <Button onClick={() => router.push("/dispatch-invoice/create")}>
                    <PlusIcon /> Create New
                </Button>
            </div>

        </div>
    )
}

export default DispatchInvoiceManagement