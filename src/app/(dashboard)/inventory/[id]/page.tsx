"use client"

import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { getErrorMessage } from '@/lib/error-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GET_ALL_INVENTORY } from '@/modules/inventory/types'
import { inventoryApi } from '@/modules/inventory/api'
import { inventoryManagementScheme } from '@/modules/inventory/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FieldPath, useForm, ControllerProps } from 'react-hook-form'
import { StatusBadge } from '@/components/shared/status-badge'
import { appToast } from '@/lib/toast-utils'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { FullPageLoader } from "@/components/shared/loader"

type InventoryFormValues = z.infer<typeof inventoryManagementScheme>

function ViewInventoryItem() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const id = params.id as string;

    const form = useForm<InventoryFormValues>({
        resolver: zodResolver(inventoryManagementScheme),
        defaultValues: {
            item_category: "",
            item_sub_category: "",
            item_name: "",
            size: "",
            quantity: 0,
            unit_of_measure: "",
            reorder_level: "",
            status: "",
            remarks: "",
        },
    })

    useEffect(() => {
        async function fetchInventoryData() {
            try {
                setIsLoading(true);
                const response = await inventoryApi.getById(id);
                const data = (Array.isArray(response.data) ? response.data[0] : response.data) as GET_ALL_INVENTORY;

                // Populate form with fetched data
                form.reset({
                    item_category: data.item_category,
                    item_sub_category: data.item_sub_category,
                    item_name: data.item_name,
                    size: data.size,
                    // Parse quantity as number because schema expects number, but API might return string
                    quantity: Number(data.quantity) || 0,
                    unit_of_measure: data.unit_of_measure,
                    reorder_level: data.reorder_level,
                    status: data.status,
                    remarks: data.remarks,
                });
            } catch (error) {
                console.error("Failed to fetch inventory item:", error);
                appToast.error("Failed to load inventory data", getErrorMessage(error));
                router.push("/inventory");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchInventoryData();
        }
    }, [id, form, router]);

    const renderFormField = <TName extends FieldPath<InventoryFormValues>>(
        name: TName,
        render: ControllerProps<InventoryFormValues, TName>["render"]
    ) => (
        <FormField<InventoryFormValues, TName>
            control={form.control}
            name={name}
            render={render}
        />
    );

    const readonlyClass = "disabled:opacity-100 disabled:text-black disabled:cursor-default bg-muted/50";

    return (
        <div className='flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3'>
            {isLoading && <FullPageLoader />}
            <PageTitleWithBreadcrumb
                title="View Inventory Item"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Inventory", href: "/inventory" },
                    { title: "View Item", href: `/inventory/${id}` },
                ]}
            />

            <Form {...form}>
                <form className='space-y-6 pb-0'>
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button variant="outline" type="button" onClick={() => router.push("/inventory")}>Back to List</Button>
                        <Button 
                            type="button" 
                            onClick={() => router.push(`/inventory/${id}/edit`)}
                        >
                            Edit Item
                        </Button>
                    </div>

                    <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                        <CardHeader className="flex flex-col gap-[0.5px]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-md font-medium mb-2">Inventory Details</h3>
                                    <p className="text-xs text-muted-foreground mb-4">View inventory item details</p>
                                </div>
                                <div className="mb-4">
                                    <StatusBadge status={form.watch("status")} type="INVENTORY" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderFormField("item_category", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Category</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} placeholder="Item Category" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("item_sub_category", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub Category</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} placeholder="Sub Category" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderFormField("item_name", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} placeholder="Item Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("size", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} placeholder="Size" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                {renderFormField("quantity", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} type="number" placeholder="Quantity" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("unit_of_measure", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit of Measure</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} placeholder="UOM" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("reorder_level", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reorder Level</FormLabel>
                                        <FormControl><Input disabled className={readonlyClass} placeholder="Reorder Level" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            {renderFormField("remarks", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl><Textarea disabled className={cn("resize-none", readonlyClass)} placeholder="Remarks" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    )
}

export default ViewInventoryItem
