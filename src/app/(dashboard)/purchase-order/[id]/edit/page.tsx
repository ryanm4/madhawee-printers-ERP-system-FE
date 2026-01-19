"use client"
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { purchaseOrderScheme } from '@/modules/purchase-order/validation'
import { cn } from '@/lib/utils'
import { useRouter, useParams } from 'next/navigation'
import { FieldPath, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Edit2, Loader2, PlusIcon, Trash2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { PurchaseOrderType } from '@/config/enum'
import { useEffect, useState } from 'react'
import { CustomerApi } from '@/modules/customer/api'
import { CUSTOMER } from '@/modules/customer/types'
import { QUOTATIONS } from '@/modules/quotations/types'
import { quotationApi } from '@/modules/quotations/api'
import { purchaseOrderApi } from '@/modules/purchase-order/api'
import { toast } from 'sonner'


type PurchaseOrderFormValues = z.infer<typeof purchaseOrderScheme>


function EditPurchaseOrder() {
    const router = useRouter()
    const params = useParams()
    const [customer, setCustomer] = useState<CUSTOMER[]>([])
    const [quotationList, setQuotationList] = useState<QUOTATIONS[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getCustomerList();
        getQuotationList();
        // TODO: Fetch existing PO data by params.id and populate form
    }, []);

    const getCustomerList = async () => {
        try {
            setLoading(true);
            const response = await CustomerApi.getAll();
            setCustomer(response.data);
        } catch (error) {
            console.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    }

    const getQuotationList = async () => {
        try {
            setLoading(true);
            const response = await quotationApi.getAll();
            setQuotationList(response.data);
        } catch (error) {
            console.error('Failed to fetch quotations');
        } finally {
            setLoading(false);
        }
    }

    const baseDefaultValues: PurchaseOrderFormValues = {
        customer: "",
        customerAddress: "",
        customerEmail: "",
        customerPhone: "",
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


    async function onSubmit(data: PurchaseOrderFormValues) {
        try {
            setIsSubmitting(true);
            console.log("Updating PO Data:", data)

            // TODO: Call purchaseOrderApi.update with params.id and transformed data
            // const response = await purchaseOrderApi.update(params.id as string, payload)

            toast.success("Purchase Order Updated", {
                description: `Purchase Order ${data.purchaseOrderNo} has been updated successfully.`,
            });

            form.reset(baseDefaultValues)
            form.clearErrors()
            router.push("/purchase-order")
        } catch (error) {
            console.error("Failed to update PO:", error)
            toast.error("Failed to Update Purchase Order", {
                description: "An error occurred while updating the purchase order. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    // Helper to render FormField with correct typing
    const renderFormField = <TName extends FieldPath<PurchaseOrderFormValues>>(
        name: TName,
        render: Parameters<typeof FormField<PurchaseOrderFormValues, TName>>["0"]["render"]
    ) => (
        <FormField
            control={form.control}
            name={name}
            render={render}
        />
    );


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
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/purchase-order")} disabled={isSubmitting}>Cancel</Button>
                        <Button size="lg" type="submit" className="bg-black text-white" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update"
                            )}
                        </Button>
                    </div>


                    <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Customer</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your customer details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>

                                {renderFormField("customer", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value)

                                                const selectedCustomer = customer.find(
                                                    c => String(c.customer_id) === value
                                                )

                                                if (selectedCustomer) {
                                                    form.setValue('customerAddress', selectedCustomer.address)
                                                    form.setValue('customerPhone', selectedCustomer.phone)
                                                    form.setValue('customerEmail', selectedCustomer.email)
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Customer" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {customer.map((cust) => (
                                                    <SelectItem key={cust.customer_id} value={String(cust.customer_id)}>
                                                        {cust.company_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("customerPhone", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Phone</FormLabel>
                                        <FormControl><Input placeholder="Enter Customer Phone" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("customerAddress", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Address</FormLabel>
                                        <FormControl><Textarea placeholder="Enter Customer Address" className="resize-none" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("customerEmail", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Email</FormLabel>
                                        <FormControl><Input placeholder="Enter Customer e-mail address..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}


                            </CardContent>
                        </Card>
                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Purchase Order</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your purchase order details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>
                                {renderFormField("purchaseOrderNo", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Order No <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input placeholder="Enter Purchase Order No" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}

                                {renderFormField("quotationId", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quotation No</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a Quotation" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {quotationList.map((quote: QUOTATIONS, index: number) => (
                                                    <SelectItem key={quote.quote_id || index} value={quote.quote_id}>
                                                        {quote.quote_id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                ))}


                                <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                                    {renderFormField("purchaseOrderType", ({ field }) => {
                                        const poTypeLabels: Record<PurchaseOrderType, string> = {
                                            [PurchaseOrderType.TIEP]: "TIEP",
                                            [PurchaseOrderType.NON_TIEP]: "NON-TIEP",
                                            [PurchaseOrderType.MP]: "MP",
                                        };
                                        return (
                                            <FormItem>
                                                <FormLabel>Purchase Order Type <span className="text-red-500">*</span></FormLabel>
                                                <RadioGroup
                                                    value={String(field.value)}
                                                    onValueChange={(val) => field.onChange(Number(val) as PurchaseOrderType)}
                                                    className="flex gap-4"
                                                >
                                                    {Object.values(PurchaseOrderType).filter((v): v is PurchaseOrderType => typeof v === 'number').map((type) => (
                                                        <div key={type} className="flex items-center gap-2">
                                                            <RadioGroupItem value={String(type)} id={String(type)} />
                                                            <Label htmlFor={String(type)}>{poTypeLabels[type]}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    })}
                                    {renderFormField("tceprNo", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>TC/E/PR/No</FormLabel>
                                            <FormControl><Input placeholder="Enter TC/E/PR/No" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                </div>
                                {renderFormField("batchRef", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch Ref</FormLabel>
                                        <FormControl><Input placeholder="Enter Batch Ref" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}

                                {renderFormField("poDate", ({ field }) => (
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
                                ))}
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
                                {itemDetailsFields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 mb-2 items-start">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                                            {renderFormField(`itemDetails.${index}.itemCode`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Code</FormLabel>
                                                    <FormControl><Input placeholder="Enter Item Code" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`itemDetails.${index}.description`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Enter Description" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`itemDetails.${index}.quantity`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="Enter Quantity"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`itemDetails.${index}.unit`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Enter Unit" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`itemDetails.${index}.price`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='number'
                                                            placeholder="Enter Price"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
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