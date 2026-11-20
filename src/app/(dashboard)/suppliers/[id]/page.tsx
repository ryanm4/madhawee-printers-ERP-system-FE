"use client"

import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { SupplierApi } from '@/modules/supplier/api'
import { SUPPLIER } from '@/modules/supplier/types'
import { usePermissions } from "@/hooks/use-permissions";
import {
    Detail,
    DetailGrid,
    ViewHeader,
    ViewSection,
    ViewTable,
    sentenceCase,
} from "@/components/shared/record-view";

type Contact = { id?: number; name?: string; email?: string; phone?: string }

const muted = <span className="text-muted-foreground">Not set</span>

function ViewSupplierProfile() {
    const router = useRouter()
    const { canModifySupplier } = usePermissions()
    const params = useParams();
    const id = params.id as string;

    const [supplier, setSupplier] = useState<SUPPLIER | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSupplierData() {
            try {
                setIsLoading(true);
                const response = await SupplierApi.getById(id);
                setSupplier(response.data);
            } catch (error) {
                console.error("Failed to fetch supplier:", error);
                router.push("/suppliers");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchSupplierData();
    }, [id, router]);

    const s = supplier;
    const contacts: Contact[] = (Array.isArray(s?.contacts) ? (s.contacts as Contact[]) : []).filter(
        (cp) => cp.name || cp.email || cp.phone
    );

    return (
        <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
            <PageTitleWithBreadcrumb
                title="View Supplier Profile"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Suppliers", href: "/suppliers" },
                ]}
            />

            <ViewHeader
                title={s?.company_name}
                status={s?.status as string | undefined}
                statusType="CUSTOMER"
                subtitle={s && sentenceCase(s.customer_type)}
                actions={
                    <>
                        <Button variant="outline" type="button" onClick={() => router.push("/suppliers")}>
                            Back to List
                        </Button>
                        {canModifySupplier && (
                            <Button type="button" onClick={() => router.push(`/suppliers/${id}/edit`)}>
                                <Edit className="h-4 w-4" /> Edit Supplier
                            </Button>
                        )}
                    </>
                }
            />
            {isLoading && !supplier && <RecordViewSkeleton />}

            {s && (
                <div className="grid gap-5 lg:grid-cols-2">
                    <ViewSection title="Supplier details">
                        <DetailGrid columns={2}>
                            <Detail label="Entity type" value={sentenceCase(s.customer_type)} />
                            <Detail label="Company name" value={s.company_name} />
                            <Detail
                                label="Company phone"
                                value={s.phone && <a href={`tel:${s.phone}`} className="hover:text-[#223F7A] hover:underline">{s.phone}</a>}
                            />
                            <Detail
                                label="Company email"
                                value={s.email && <a href={`mailto:${s.email}`} className="hover:text-[#223F7A] hover:underline">{s.email}</a>}
                            />
                            <Detail label="Address" value={s.address} className="col-span-2" />
                            <Detail
                                label="Credit period"
                                value={s.credit_period ? `${s.credit_period} days` : null}
                            />
                            <Detail label="VAT type" value={s.vat_type} />
                            <Detail label="VAT no" value={s.vat_no} />
                        </DetailGrid>
                    </ViewSection>

                    <ViewSection title={`Points of contact (${contacts.length})`}>
                        <ViewTable
                            rows={contacts}
                            rowKey={(cp, i) => cp.id ?? i}
                            empty="No contact people have been added."
                            columns={[
                                { header: "Name", cell: (cp) => <span className="font-medium">{cp.name || "Not set"}</span> },
                                {
                                    header: "Email",
                                    cell: (cp) => cp.email
                                        ? <a href={`mailto:${cp.email}`} className="break-all hover:text-[#223F7A] hover:underline">{cp.email}</a>
                                        : muted,
                                },
                                {
                                    header: "Phone",
                                    cell: (cp) => cp.phone
                                        ? <a href={`tel:${cp.phone}`} className="hover:text-[#223F7A] hover:underline">{cp.phone}</a>
                                        : muted,
                                },
                            ]}
                        />
                    </ViewSection>
                </div>
            )}
        </div>
    )
}

export default ViewSupplierProfile
