"use client"
import PageTitleWithBreadcrumb from '@/common/PageTitileWithBreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { purchaseOrderScheme } from '@/lib/formSchema'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Edit2, PlusIcon, Trash2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { PurchaseOrderType } from '@/lib/enum'



type PurchaseOrderFormValues = z.infer<typeof purchaseOrderScheme>


function EditPurchaseOrder() {
    const router = useRouter()

    const baseDefaultValues: PurchaseOrderFormValues = {
        customer: "",
        customerName: "",
        customerAddress: "",
        customerEmail: "",

        purchaseOrderNo: "",
        quotationId: "",
        tceprNo: "",
        purchaseOrderType: PurchaseOrderType.TIEP,
        batchRef: "",
        poDate: new Date(),
        itemDetails: [{ itemCode: "", description: "", quantity: 0, unit: "", price: 0 }]
    }

    const form = useForm<PurchaseOrderFormValues>({
        resolver: zodResolver(purchaseOrderScheme),
        defaultValues: baseDefaultValues,

    })

    const { fields: itemDetailsFields, append: appendItemDetails, remove: removeItemDetails } = useFieldArray({
        control: form.control,
        name: "itemDetails",
    })


    function onSubmit(data: PurchaseOrderFormValues) {
        console.log("Submitting PO Data:", data)
        form.reset(baseDefaultValues)
        form.clearErrors()
    }



    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Edit Purchase Order Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Purchase Order Management", href: "/purchase-order" },

                ]}
            />


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6  pb-0'>
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/purchase-order")}>Cancel</Button>
                        <Button size="lg" type="submit" className="bg-black text-white">Update</Button>
                    </div>


                    <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Customer</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your customer details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>

                                <FormField control={form.control} name="customer" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Customer" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="po1">PO-001</SelectItem>
                                                <SelectItem value="po2">PO-002</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="customerName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name</FormLabel>
                                        <FormControl><Input placeholder="Enter Customer Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="customerAddress" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Address</FormLabel>
                                        <FormControl><Textarea placeholder="Enter Customer Address" className="resize-none" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="customerEmail" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Email</FormLabel>
                                        <FormControl><Input placeholder="Enter Customer e-mail address..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />


                            </CardContent>
                        </Card>
                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Purchase Order</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your purchase order details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>
                                <FormField control={form.control} name="purchaseOrderNo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Order No <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input placeholder="Enter Purchase Order No" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="quotationId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quotation No</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a Quotation" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="po1">PO-001</SelectItem>
                                                <SelectItem value="po2">PO-002</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />


                                <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                                    <FormField control={form.control} name="purchaseOrderType" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purchase Order Type <span className="text-red-500">*</span></FormLabel>
                                            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                                                {Object.values(PurchaseOrderType).map((type) => (
                                                    <div key={type} className="flex items-center gap-2">
                                                        <RadioGroupItem value={type} id={type} />
                                                        <Label htmlFor={type}>{type}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="tceprNo" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TC/E/PR/No</FormLabel>
                                            <FormControl><Input placeholder="Enter TC/E/PR/No" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="batchRef" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch Ref</FormLabel>
                                        <FormControl><Input placeholder="Enter Batch Ref" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="poDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PO Date <span className="text-red-500">*</span></FormLabel>
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
                            </CardContent>
                        </Card>
                    </div>

                    <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                        <CardHeader className="flex flex-col gap-[0.5px]">
                            <h3 className="text-md font-medium mb-2">Item Details</h3>
                            <p className="text-xs text-muted-foreground mb-4">Add your Item Details here</p>

                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <div className="flex justify-end">
                                <Button type="button" variant="secondary" onClick={() => appendItemDetails({ itemCode: "", description: "", quantity: 0, unit: "", price: 0 })}><PlusIcon />Add More</Button>
                            </div>
                            <div>
                                {itemDetailsFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2 mb-2 items-start">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                                            <FormField control={form.control} name={`itemDetails.${index}.itemCode`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Code</FormLabel>
                                                    <FormControl><Input placeholder="Enter Item Code" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`itemDetails.${index}.description`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Enter Description" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`itemDetails.${index}.quantity`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type="number" placeholder="Enter Quantity" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`itemDetails.${index}.unit`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Enter Unit" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`itemDetails.${index}.price`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type='number' placeholder="Enter Price" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="flex space-x-2 items-start pt-5">
                                            <Button type="button" variant="outline" size="icon" onClick={() => { }}><Edit2 className="h-4 w-4" /></Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeItemDetails(index)}
                                                disabled={itemDetailsFields.length <= 1} // Disable if only one item
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    )
}

export default EditPurchaseOrder