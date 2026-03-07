"use client"

import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { inventoryApi } from '@/modules/inventory/api'
import { inventoryManagementScheme } from '@/modules/inventory/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FieldPath, useForm, ControllerProps } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn } from '@/lib/utils'

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
                // @ts-ignore
                const data = response.data[0] || response.data; // Handle potential array response or single object

                // Populate form with fetched data
                form.reset({
                    item_category: data.item_category,
                    item_sub_category: data.item_sub_category,
                    item_name: data.item_name,
                    size: data.size,
                    // Parse quantity as number because schema expects number, but API might return string
                    // @ts-ignore
                    quantity: Number(data.quantity) || 0,
                    unit_of_measure: data.unit_of_measure,
                    reorder_level: data.reorder_level,
                    status: data.status,
                    remarks: data.remarks,
                });
            } catch (error) {
                console.error("Failed to fetch inventory item:", error);
                toast("Failed to load inventory data");
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

    return (
        <div className='flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3'>
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
                    <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                        <CardHeader className="flex flex-col gap-[0.5px]">
                            <h3 className="text-md font-medium mb-2">Inventory Details</h3>
                            <p className="text-xs text-muted-foreground mb-4">View inventory item details</p>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderFormField("item_category", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Category</FormLabel>
                                        <FormControl><Input readOnly placeholder="Item Category" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("item_sub_category", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub Category</FormLabel>
                                        <FormControl><Input readOnly placeholder="Sub Category" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderFormField("item_name", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl><Input readOnly placeholder="Item Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("size", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl><Input readOnly placeholder="Size" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                {renderFormField("quantity", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl><Input readOnly type="number" placeholder="Quantity" {...field} onChange={event => field.onChange(+event.target.value)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("unit_of_measure", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit of Measure</FormLabel>
                                        <FormControl><Input readOnly placeholder="UOM" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("reorder_level", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reorder Level</FormLabel>
                                        <FormControl><Input readOnly placeholder="Reorder Level" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderFormField("status", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl><Input readOnly placeholder="Status" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            {renderFormField("remarks", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl><Textarea readOnly placeholder="Remarks" className="resize-none" {...field} /></FormControl>
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
