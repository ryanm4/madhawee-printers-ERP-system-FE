"use client"

import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { supplierSchema } from '@/modules/supplier/validation'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FieldPath, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Edit } from 'lucide-react'
import { CustomerType } from '@/config/enum'
import { SupplierApi } from '@/modules/supplier/api'
import { FullPageLoader } from "@/components/shared/loader";

type SupplierFormValues = z.infer<typeof supplierSchema>

function ViewSupplierProfile() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const id = params.id as string;

    const baseDefaultValues: SupplierFormValues = {
        customer_type: CustomerType.SUPPLIER,
        companyName: "",
        address: "",
        phone: "",
        email: "",
        creditPeriod: "",
        vat_type: "",
        vat_no: "",
        logoUrl: "",
        contactPersons: [
          {
            name: "",
            email: "",
            phone: "",
          }
        ],
        created_by: "", 
        status: "Active",
    }

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: baseDefaultValues,
    })

    useEffect(() => {
        async function fetchSupplierData() {
            try {
                setIsLoading(true);
                const response = await SupplierApi.getById(id);
                const data = response.data;

                form.reset({
                    customer_type: data.customer_type,
                    companyName: data.company_name,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    creditPeriod: data.credit_period,
                    vat_type: data.vat_type,
                    vat_no: data.vat_no,
                    logoUrl: data.logo_url,
                    contactPersons: (() => {
                        const arr = Array.isArray(data.contact_persons) ? data.contact_persons : (typeof data.contact_persons === 'string' && data.contact_persons ? JSON.parse(data.contact_persons) : []) as Array<Record<string, unknown>>;
                        return arr.length > 0 ? arr.map((cp) => ({
                            id: (cp.id as number) || undefined,
                            name: (cp.name as string) || "",
                            email: (cp.email as string) || "",
                            phone: (cp.phone as string) || "",
                        })) : [{ name: "", email: "", phone: "" }];
                    })(),
                    created_by: data.created_by,
                });
            } catch (error) {
                console.error("Failed to fetch supplier:", error);
                router.push("/suppliers");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchSupplierData();
        }
    }, [id, form, router]);

    const renderFormField = <TName extends FieldPath<SupplierFormValues>>(
        name: TName,
        render: Parameters<typeof FormField<SupplierFormValues, TName>>["0"]["render"]
    ) => (
        <FormField
            control={form.control}
            name={name}
            render={render}
        />
    );

    return (
        <div className='flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3'>
            {isLoading && <FullPageLoader />}
            <PageTitleWithBreadcrumb
                title="View Supplier Profile"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Suppliers", href: "/suppliers" },
                ]}
            />

            <Form {...form}>
                <form className='space-y-6  pb-0'>
                    <div className="flex items-center justify-end gap-3 w-full mt-6 mb-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => router.push("/suppliers")}
                        >
                            Back to List
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push(`/suppliers/${id}/edit`)}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Edit className="mr-2 h-4 w-4" /> Edit Supplier
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Supplier Details</h3>
                                <p className="text-xs text-muted-foreground mb-4">Core information for this supplier profile.</p>
                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>
                                {renderFormField("customer_type", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entity Type</FormLabel>
                                        <FormControl><Input readOnly {...field} className="bg-muted" /></FormControl>
                                    </FormItem>
                                ))}
                                <div className='flex flex-row gap-4'>
                                    {renderFormField("companyName", ({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl><Input readOnly {...field} /></FormControl>
                                        </FormItem>
                                    ))}
                                    {renderFormField("phone", ({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Company Phone</FormLabel>
                                            <FormControl><Input readOnly {...field} /></FormControl>
                                        </FormItem>
                                    ))}
                                </div>
                                {renderFormField("address", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl><Textarea readOnly className="resize-none" {...field} /></FormControl>
                                    </FormItem>
                                ))}
                                <div className='flex flex-row gap-4'>
                                    {renderFormField("email", ({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Company Email</FormLabel>
                                            <FormControl><Input readOnly {...field} /></FormControl>
                                        </FormItem>
                                    ))}
                                    {renderFormField("creditPeriod", ({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Credit Period (Days)</FormLabel>
                                            <FormControl><Input readOnly {...field} /></FormControl>
                                        </FormItem>
                                    ))}
                                </div>
                                <div className='flex flex-row gap-4'>
                                    {renderFormField("vat_type", ({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Vat Type</FormLabel>
                                            <FormControl><Input readOnly {...field} /></FormControl>
                                        </FormItem>
                                    ))}
                                    {renderFormField("vat_no", ({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>VAT No</FormLabel>
                                            <FormControl><Input readOnly {...field} /></FormControl>
                                        </FormItem>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                                <CardHeader className="flex flex-col gap-[0.5px]">
                                    <h3 className="text-md font-medium mb-2">Points of Contact</h3>
                                    <p className="text-xs text-muted-foreground mb-4">Contact individuals for this supplier.</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {form.watch("contactPersons")?.map((_, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-lg bg-accent/5">
                                            {renderFormField(`contactPersons.${index}.name`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl><Input readOnly {...field} /></FormControl>
                                                </FormItem>
                                            ))}
                                            {renderFormField(`contactPersons.${index}.email`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl><Input readOnly {...field} /></FormControl>
                                                </FormItem>
                                            ))}
                                            {renderFormField(`contactPersons.${index}.phone`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl><Input readOnly {...field} /></FormControl>
                                                </FormItem>
                                            ))}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ViewSupplierProfile
