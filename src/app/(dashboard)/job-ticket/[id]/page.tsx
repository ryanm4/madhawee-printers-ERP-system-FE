"use client"

import { FieldPath, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Edit2, Trash2 } from "lucide-react" // Import icons
import { format } from "date-fns"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { jobTicketSchema } from "@/modules/job-tickets/validation"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CUSTOMER } from "@/modules/customer/types"
import { CustomerApi } from "@/modules/customer/api"
import { COATING_TYPES, PLATES_STATUS, PRODUCT_TYPES } from "@/config/enum"
import { PaperTypeCombobox } from "../_components/paper-type-combobox"
import { Combobox } from "@/components/shared/combobox"
import { PURCHASE_ORDER, PURCHASE_ORDER_ID } from "@/modules/purchase-order/types"
import { purchaseOrderApi } from "@/modules/purchase-order/api"
import { jobTicketsApi } from "@/modules/job-tickets/api"

type JobTicketFormValues = z.infer<typeof jobTicketSchema>

function JobViewTicket() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CUSTOMER[]>([])
    const [purchaseOrderData, setPurchaseOrderData] = useState<PURCHASE_ORDER[]>([]);
    const [selectedPoDetails, setSelectedPoDetails] = useState<PURCHASE_ORDER_ID | null>(null);

    const baseDefaultValues = {
        poNumber: "",
        item: "",
        orderReceivedDate: undefined,
        jobNumber: "",
        jobOpenDate: undefined,
        customer: "",
        jobName: "",
        productType: "",
        quantity: "",
        wastage: "",
        deliveryDate: undefined,
        packingDate: undefined,
        expiryDate: undefined,
        tcNo: "",
        batchRef: "",
        remarks: "",
        addAnotherJob: false,
        oldPlatesQuantity: "",
        oldPlatesStatus: "",
        oldPlatesRemarks: "",
        newPlatesQuantity: "",
        newPlatesStatus: "",
        newPlatesRemarks: "",
        inks: [
            { ink: "Black", quantity: "", status: "", remarks: "" },
            { ink: "Cyan", quantity: "", status: "", remarks: "" },
            { ink: "Magenta", quantity: "", status: "", remarks: "" },
            { ink: "Yellow", quantity: "", status: "", remarks: "" },
        ],
        paperTypes: [{ paper: "", coating: "", rawMaterials: [{ item_id: undefined, material_name: "", material_type: "", size: "", material_description: "", quantity: 0, status: "", remarks: "" }] }] as any[],
    }

    const form = useForm<JobTicketFormValues>({
        resolver: zodResolver(jobTicketSchema),
        defaultValues: baseDefaultValues,
    })



    const { fields: paperTypeFields } = useFieldArray({
        control: form.control,
        name: "paperTypes",
    })

    const { fields: inkFields } = useFieldArray({
        control: form.control,
        name: "inks",
    })

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const [poResponse, customerResponse] = await Promise.all([
                    purchaseOrderApi.getAll(),
                    CustomerApi.getAll()
                ]);

                setPurchaseOrderData(poResponse.data);
                setCustomerData(customerResponse.data);
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchJobTicket = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await jobTicketsApi.getById(id);
                if (response.status === 200) {
                    const data = response.data as any; // Casting because ALL_TICKETS might be missing some fields

                    // Map API data to form values
                    const formValues: any = {
                        poNumber: data.po_id ? String(data.po_id) : "",
                        item: data.item_code || "",
                        jobNumber: data.job_number || "",
                        orderReceivedDate: data.order_received_date ? new Date(data.order_received_date) : undefined,
                        jobOpenDate: data.created_on ? new Date(data.created_on) : undefined,
                        customer: data.customer_id ? String(data.customer_id) : "",
                        jobName: data.job_name || "",
                        productType: data.product_type || "",
                        quantity: data.quantity ? String(data.quantity) : "",
                        deliveryDate: data.delivery_date ? new Date(data.delivery_date) : undefined,
                        wastage: data.wastage ? String(data.wastage) : "",
                        packingDate: data.packing_date ? new Date(data.packing_date) : undefined,
                        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
                        tcNo: data.tc_no || "",
                        batchRef: data.batch_ref || "",
                        remarks: data.remarks || "",

                        oldPlatesQuantity: data.old_plate_quantity || "",
                        oldPlatesStatus: data.old_plate_status || "",
                        oldPlatesRemarks: data.old_plate_remarks || "",
                        newPlatesQuantity: data.new_plate_quantity || "",
                        newPlatesStatus: data.new_plate_status || "",
                        newPlatesRemarks: data.new_plate_remarks || "",

                        rawMaterials: undefined,
                        inks: data.inks?.length ? data.inks : [
                            { ink: "Black", quantity: "", status: "", remarks: "" },
                            { ink: "Cyan", quantity: "", status: "", remarks: "" },
                            { ink: "Magenta", quantity: "", status: "", remarks: "" },
                            { ink: "Yellow", quantity: "", status: "", remarks: "" },
                        ],
                        paperTypes: data.paperCoatingData?.map((p: any) => ({
                            paper: p.paper,
                            coating: p.coating,
                            rawMaterials: p.materials?.map((rm: any) => ({
                                item_id: rm.item_id,
                                material_name: rm.material_name,
                                material_type: rm.material_type,
                                size: rm.size || "",
                                material_description: rm.material_description,
                                quantity: rm.quantity,
                                status: rm.status,
                                remarks: rm.remarks,
                            })) || [{ item_id: undefined, material_name: "", material_type: "", size: "", material_description: "", quantity: 0, status: "", remarks: "" }],
                        })) || [{ paper: "", coating: "", rawMaterials: [{ item_id: undefined, material_name: "", material_type: "", size: "", material_description: "", quantity: 0, status: "", remarks: "" }] }],
                    };

                    form.reset(formValues);

                    // If PO is selected, fetch PO details to populate item options (though read-only)
                    if (data.po_id) {
                        const poResponse = await purchaseOrderApi.getById(data.po_id);
                        if (poResponse.status === 200) {
                            setSelectedPoDetails(poResponse.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch job ticket', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobTicket();
    }, [id, form]);

    const selectedPoId = form.watch("poNumber");

    useEffect(() => {
        const fetchPoDetails = async () => {
            if (!selectedPoId) {
                setSelectedPoDetails(null);
                return;
            }
            try {
                const response = await purchaseOrderApi.getById(selectedPoId);
                if (response.status === 200) {
                    const po = response.data;
                    setSelectedPoDetails(po);

                    if (po.customer) {
                        form.setValue("customer", String(po.customer.customer_id));
                    }
                    if (po.po_date) {
                        form.setValue("orderReceivedDate", new Date(po.po_date));
                    }
                    form.setValue("tcNo", po.TC_E_PR_No);
                    form.setValue("batchRef", po.batch_ref);
                }
            } catch (err) {
                console.error("Error fetching PO details in view", err);
            }
        };

        fetchPoDetails();
    }, [selectedPoId, form]);

    const renderFormField = <TName extends FieldPath<JobTicketFormValues>>(
        name: TName,
        render: Parameters<typeof FormField<JobTicketFormValues, TName>>["0"]["render"]
    ) => (
        <FormField
            control={form.control}
            name={name}
            render={render}
        />
    );

    const selectedPoItems = selectedPoDetails?.po_items ?? [];

    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="View Job Ticket"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Job Ticket", href: "/job-ticket" },
                    { title: "View", href: "#" },
                ]}
            />

            <Form {...form}>
                <form className="space-y-6 pb-0">
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/job-ticket")}>Back</Button>
                    </div>
                    <Card className={cn("w-full shdow-sm hover:shadow-md transition-shadow flex flex-col")}>
                        <CardHeader className="flex flex-col gap-[0.5px]">
                            <h3 className="text-md font-medium mb-2">Job Ticket Details</h3>
                            <p className="text-xs text-muted-foreground mb-4">View Job Ticket Details</p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("poNumber", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>PO Number</FormLabel>
                                        <Combobox
                                            items={purchaseOrderData.map(po => ({ value: String(po.po_id), label: String(po.po_id) }))}
                                            value={field.value || ""}
                                            onValueChange={() => { }}
                                            placeholder="Select PO Number"
                                            searchPlaceholder="Search PO..."
                                            disabled
                                        />
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("item", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item</FormLabel>
                                        <Combobox
                                            items={selectedPoItems.map((item: any) => ({ value: item.item_code, label: item.item_code }))}
                                            value={field.value || ""}
                                            onValueChange={() => { }}
                                            placeholder={field.value || "Select Item"}
                                            disabled
                                            searchPlaceholder="Search item..."
                                        />
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("jobNumber", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Number</FormLabel>
                                        <FormControl><Input placeholder="MPL/####/YY/TIEP" {...field} readOnly /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("orderReceivedDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Received Date</FormLabel>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled>
                                                {field.value ? format(field.value, "PPP") : "No Date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderFormField("jobOpenDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Open Date</FormLabel>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled>
                                                {field.value ? format(field.value, "PPP") : "No Date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("customer", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Combobox
                                            items={customerData.map((customer) => ({
                                                value: String(customer.customer_id),
                                                label: `Job-${customer.customer_id} (${customer.company_name})`
                                            }))}
                                            value={field.value || ""}
                                            onValueChange={() => { }}
                                            placeholder="Select Customer"
                                            searchPlaceholder="Search customer..."
                                            disabled
                                        />
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("jobName", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Name</FormLabel>
                                        <FormControl><Input placeholder="Enter Job Name" {...field} readOnly /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            {/* Product Details */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {renderFormField("productType", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Type</FormLabel>
                                        <Select value={field.value} disabled>
                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Product Type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Object.entries(PRODUCT_TYPES).map(([key, value]) => (
                                                    <SelectItem key={key} value={value}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("quantity", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl><Input type="number" placeholder="Enter Quantity" {...field} readOnly /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("deliveryDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Date</FormLabel>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled>
                                                {field.value ? format(field.value, "PPP") : "No Date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}

                                {renderFormField("wastage", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wastage %</FormLabel>
                                        <FormControl><Input type="number" placeholder="Enter Wastage" {...field} readOnly /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Paper & Raw Material</h3>
                                {paperTypeFields.map((field, index) => {
                                    const rawMaterials = form.watch(`paperTypes.${index}.rawMaterials`) || [];
                                    return (
                                        <div key={field.id} className="border rounded-lg p-4 mb-4 bg-muted/20">
                                            <h4 className="text-sm font-semibold mb-4">Set {index + 1}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {renderFormField(`paperTypes.${index}.paper`, ({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Paper Type</FormLabel>
                                                        <div className="pointer-events-none opacity-50">
                                                            <PaperTypeCombobox value={field.value} onChange={() => { }} />
                                                        </div>
                                                        <FormMessage className="min-h-[20px]" />
                                                    </FormItem>
                                                ))}
                                                {renderFormField(`paperTypes.${index}.coating`, ({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Coating</FormLabel>
                                                        <Select value={field.value} disabled>
                                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Coating" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {Object.entries(COATING_TYPES).map(([key, value]) => (
                                                                    <SelectItem key={key} value={value}>
                                                                        {value}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="min-h-[20px]" />
                                                    </FormItem>
                                                ))}
                                            </div>

                                            {/* Raw Materials for this Paper Type */}
                                            <h5 className="text-xs font-medium mb-2 mt-2">Raw Materials</h5>
                                            {rawMaterials.map((_rm: any, rmIndex: number) => (
                                                <div key={rmIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                                    {renderFormField(`paperTypes.${index}.rawMaterials.${rmIndex}.material_name`, ({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Raw Material</FormLabel>
                                                            <FormControl><Input placeholder="Material" {...field} value={field.value as string || ""} readOnly /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    ))}
                                                    {renderFormField(`paperTypes.${index}.rawMaterials.${rmIndex}.quantity`, ({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                            <FormControl><Input type="number" placeholder="Quantity" {...field} value={field.value as number || 0} readOnly /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    ))}
                                                    {renderFormField(`paperTypes.${index}.rawMaterials.${rmIndex}.status`, ({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Status</FormLabel>
                                                            <FormControl><Input placeholder="Status" {...field} value={field.value as string || ""} readOnly /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    ))}
                                                    {renderFormField(`paperTypes.${index}.rawMaterials.${rmIndex}.remarks`, ({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                                            <FormControl><Input placeholder="Remarks" {...field} value={field.value as string || ""} readOnly /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("packingDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Packing Date</FormLabel>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled>
                                                {field.value ? format(field.value, "PPP") : "No Date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("expiryDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled>
                                                {field.value ? format(field.value, "PPP") : "No Date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                {renderFormField("tcNo", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>TC No</FormLabel>
                                        <FormControl><Input placeholder="Enter TC No" {...field} readOnly /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("batchRef", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch Ref</FormLabel>
                                        <FormControl><Input placeholder="Enter Batch Ref" {...field} readOnly /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            {renderFormField("remarks", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl><Textarea placeholder="Enter Remarks" className="resize-none" {...field} readOnly /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}

                            {/* CTP Plates */}
                            <div>
                                <h3 className="text-sm font-medium mb-2">CTP Plates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                    {renderFormField("oldPlatesQuantity", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Plates Quantity</FormLabel>
                                            <FormControl><Input type="number" placeholder="Quantity" {...field} readOnly /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                    {renderFormField("oldPlatesStatus", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Plates Status</FormLabel>
                                            <Select value={field.value} disabled>
                                                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.entries(PLATES_STATUS).map(([key, value]) => (
                                                        <SelectItem key={key} value={value}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                    {renderFormField("oldPlatesRemarks", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Plates Remarks</FormLabel>
                                            <FormControl><Input placeholder="Remarks" {...field} readOnly /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFormField("newPlatesQuantity", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Plates Quantity</FormLabel>
                                            <FormControl><Input type="number" placeholder="Quantity" {...field} readOnly /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                    {renderFormField("newPlatesStatus", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Plates Status</FormLabel>
                                            <Select value={field.value} disabled>
                                                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.entries(PLATES_STATUS).map(([key, value]) => (
                                                        <SelectItem key={key} value={value}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                    {renderFormField("newPlatesRemarks", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Plates Remarks</FormLabel>
                                            <FormControl><Input placeholder="Remarks" {...field} readOnly /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                </div>
                            </div>

                            {/* Ink Section */}
                            <div>
                                <h3 className="text-sm font-medium">Ink</h3>
                                {inkFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 mb-2">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                            {renderFormField(`inks.${index}.ink`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Ink</FormLabel>
                                                    <FormControl><Input placeholder="Ink Name" {...field} value={field.value || ""} readOnly /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`inks.${index}.quantity`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Enter Quantity" {...field} readOnly /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`inks.${index}.status`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Status</FormLabel>
                                                    <Select value={field.value} disabled>
                                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select an Status" /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="s1">Status 1</SelectItem></SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`inks.${index}.remarks`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                                    <FormControl><Input placeholder="Enter Remarks" {...field} readOnly /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
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

export default JobViewTicket