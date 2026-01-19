"use client"
import { dispatchInvoiceScheme } from '@/modules/dispatch-invoice/validation';
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
type DispatchFormValues = z.infer<typeof dispatchInvoiceScheme>

function CreateDispatchandInvoice() {
    const router = useRouter();

    const baseDefaultValues: DispatchFormValues = {
        job_id: "",
        customer_address: "",
        customer_name: "",
        customer_phone: 0,
        delivery_address: "",
        dispatch_note: "",
        dispatch_date: new Date(),
        dispatch_quantity: 0,
        dispatch_bundles_qty: 0,
        dispatch_description: "",
    }

    const form = useForm<DispatchFormValues>({
        resolver: zodResolver(dispatchInvoiceScheme),
        defaultValues: baseDefaultValues,

    })

    function onSubmit(data: DispatchFormValues) {
        console.log("Submitting PO Data:", data)
        form.reset(baseDefaultValues)
        form.clearErrors()
    }

    return (
        <div className='flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3'>
            <PageTitleWithBreadcrumb
                title="Create Dispatch and Invoice Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Dispatch and Invoice Management", href: "/dispatch-invoice" },

                ]}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6  pb-0'>
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/dispatch-invoice")}>Cancel</Button>
                        <Button size="lg" type="submit" className="bg-black text-white">Save</Button>
                    </div>


                    <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Purchase Order</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your purchase order details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>

                                <FormField control={form.control} name="job_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job ID</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select an Item" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="po1">PO-001</SelectItem>
                                                    <SelectItem value="po2">PO-002</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className='flex flex-row gap-4'>
                                    <FormField control={form.control} name="customer_name" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Customer Name<span className="text-red-500">*</span></FormLabel>
                                            <FormControl><Input placeholder="Enter Company Name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="customer_phone" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Customer Phone</FormLabel>
                                            <FormControl><Input placeholder="Enter Customer Phone" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="customer_address" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Address</FormLabel>
                                        <FormControl><Textarea placeholder="Enter Customer Address" className="resize-none" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="delivery_address" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Address</FormLabel>
                                        <FormControl><Textarea placeholder="Enter Deliver Address" className="resize-none" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />


                            </CardContent>
                        </Card>

                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Dispatch Note</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your dispatch note details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>
                                <FormField control={form.control} name="dispatch_note" render={({ field }) => (
                                    <FormItem >
                                        <FormLabel>Dispatch Note</FormLabel>
                                        <FormControl><Input placeholder="Enter dispatch note" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="dispatch_date" render={({ field }) => (
                                    <FormItem >
                                        <FormLabel>Dispatch Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : format(new Date(), "PPP")}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown" />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className='flex flex-rows gap-4'>
                                    <FormField control={form.control} name="dispatch_quantity" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Dispatch Quantity</FormLabel>
                                            <FormControl><Input placeholder="Enter dispatch quantity" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="dispatch_bundles_qty" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>No.of Bundles</FormLabel>
                                            <FormControl><Input placeholder="Enter bundle value" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="dispatch_description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dispatch Description</FormLabel>
                                        <FormControl><Textarea placeholder="Type your message here." className="resize-none" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </div>


                </form>
            </Form>
        </div>
    )
}

export default CreateDispatchandInvoice