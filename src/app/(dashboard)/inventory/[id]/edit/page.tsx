"use client"
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ITEM_CATEGORY, ITEM_SUB_CATEGORY, UNIT_OF_MEASSURE } from '@/config/enum'
import { cn } from '@/lib/utils'
import { inventoryApi } from '@/modules/inventory/api'
import { CREATE_INVENTORY } from '@/modules/inventory/types'
import { inventoryManagementScheme } from '@/modules/inventory/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'
import { FieldPath, useForm, ControllerProps } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type InventoryManagementFormValues = z.infer<typeof inventoryManagementScheme>



function EditInventoryManagement() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)
    const params = useParams();
    const id = params.id as string;

    const baseDefaultValues: InventoryManagementFormValues = {
        item_category: "",
        item_sub_category: "",
        item_name: "",
        size: "",
        quantity: 0,
        unit_of_measure: "",
        reorder_level: "",
        status: "",
        remarks: "",
    }

    const form = useForm<InventoryManagementFormValues>({
        resolver: zodResolver(inventoryManagementScheme),
        defaultValues: baseDefaultValues,

    })


    useEffect(() => {
        const userData = getUser()
        if (userData) {
            setUser({
                name: userData.name || "User",
                email: userData.email,
                avatar: "",
            })
        }
    }, [])

    useEffect(() => {
        async function fetchInventoryData() {
            try {
                setIsLoading(true);
                const response = await inventoryApi.getById(id);
                const data = response.data;

                // ✅ Populate form with fetched data
                form.reset({
                    item_category: data.item_category,
                    item_sub_category: data.item_sub_category,
                    item_name: data.item_name,
                    size: data.size,
                    quantity: Number(data.quantity),
                    unit_of_measure: data.unit_of_measure,
                    reorder_level: data.reorder_level,
                    status: data.status,
                    remarks: data.remarks || "",
                });
            } catch (error) {
                console.error("Failed to fetch inventory:", error);
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

    async function onSubmit(data: InventoryManagementFormValues) {

        try {
            setIsLoading(true);
            const payload: CREATE_INVENTORY = {
                item_category: data.item_category,
                item_sub_category: data.item_sub_category,
                item_name: data.item_name,
                size: data.size,
                quantity: String(data.quantity),
                unit_of_measure: data.unit_of_measure,
                reorder_level: data.reorder_level,
                status: data.status,
                remarks: data.remarks ?? "",
                updated_by: user?.name || "Admin",
            }
            const response = await inventoryApi.update(id, payload);


            toast("Inventory Item Updated", {
                description: "The inventory item has been updated successfully."
            });
            form.reset(baseDefaultValues)
            form.clearErrors()
            router.push("/inventory")
        } catch (error) {
            console.error("Failed to update inventory:", error)
            toast("Failed to Update Inventory Item", {
                description: "An error occurred while updating the inventory item. Please try again."
            });
        } finally {
            setIsLoading(false);
        }

    }

    const renderFormField = <TName extends FieldPath<InventoryManagementFormValues>>(
        name: TName,
        render: ControllerProps<InventoryManagementFormValues, TName>["render"]
    ) => (
        <FormField<InventoryManagementFormValues, TName>
            control={form.control}
            name={name}
            render={render}
        />
    );


    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Edit Inventory Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Inventory Management", href: "/inventory" },

                ]}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6  pb-0'>
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/inventory")} disabled={isLoading}>Cancel</Button>
                        <Button size="lg" type="submit" className="bg-primary text-white" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update"}
                        </Button>
                    </div>

                    <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                        <CardHeader className="flex flex-col gap-[0.5px]">
                            <h3 className="text-md font-medium mb-2">Inventory Management</h3>
                            <p className="text-xs text-muted-foreground mb-4">Edit your Inventory details here</p>

                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>

                            {renderFormField("item_category", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Category  <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Item Category" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.entries(ITEM_CATEGORY).map(([key, value]) => (
                                                <SelectItem key={key} value={value}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("item_sub_category", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Sub Category <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Item Sub Category" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.entries(ITEM_SUB_CATEGORY).map(([key, value]) => (
                                                <SelectItem key={key} value={value}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("item_name", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input placeholder="Enter Item Name" className="resize-none" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("size", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Size <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input placeholder="Enter Size" className="resize-none" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("quantity", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Quantitiy <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input type='number' placeholder="Enter Item Quantity"
                                        value={field.value}
                                        onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("unit_of_measure", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit of Measure <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Unit of Meassure" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Object.values(UNIT_OF_MEASSURE).map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("reorder_level", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Re-order Level <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input type="number" placeholder="Enter Re-order Level" value={field.value}
                                        onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("status", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            ))}
                            {renderFormField("remarks", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl><Textarea placeholder="Enter Remarks" {...field} /></FormControl>
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

export default EditInventoryManagement
