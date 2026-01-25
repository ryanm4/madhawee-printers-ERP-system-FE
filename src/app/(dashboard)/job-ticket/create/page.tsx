"use client"

import { FieldPath, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, CloudUpload, Plus, Trash2, Edit2, X, FileArchive } from "lucide-react" // Import icons
import { format } from "date-fns"
import { useState, useRef, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

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
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CUSTOMER } from "@/modules/customer/types"
import { CustomerApi } from "@/modules/customer/api"
import { COATING_TYPES, INK_STATUS, PAPER_TYPES, PLATES_STATUS, PRODUCT_TYPES } from "@/config/enum"
import { PaperTypeCombobox } from "../_components/paper-type-combobox"
import { Combobox } from "@/components/shared/combobox"
import { PURCHASE_ORDER, PURCHASE_ORDER_ID } from "@/modules/purchase-order/types"
import { purchaseOrderApi } from "@/modules/purchase-order/api"
import { toMySQLDateTime } from "@/hooks/sql-date-time"
import { CREATE_TICKETS } from "@/modules/job-tickets/types"
import { toast } from "sonner"
import { jobTicketsApi } from "@/modules/job-tickets/api"

type JobTicketFormValues = z.infer<typeof jobTicketSchema>


function CreateJobTicket() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CUSTOMER[]>([])
    const [purchaseOrderData, setPurchaseOrderData] = useState<PURCHASE_ORDER[]>([]);
    const [selectedPoDetails, setSelectedPoDetails] = useState<PURCHASE_ORDER_ID | null>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const baseDefaultValues = {
        poNumber: "",
        item: "",
        orderReceivedDate: undefined,
        jobNumber: "",
        jobOpenDate: undefined,
        customer: "",
        jobName: "",
        productType: "",
        completed_qty: "",
        quantity: "",
        wastage: "",
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
        rawMaterials: [{ item: "", quantity: "", status: "", remarks: "" }],
        inks: [
            { ink: "Black", quantity: "", status: "", remarks: "" },
            { ink: "Cyan", quantity: "", status: "", remarks: "" },
            { ink: "Magenta", quantity: "", status: "", remarks: "" },
            { ink: "Yellow", quantity: "", status: "", remarks: "" },
        ],
        paperTypes: [{ paper_type: "", coating: "", delivery_date: new Date() }],
    }

    const form = useForm<JobTicketFormValues>({
        resolver: zodResolver(jobTicketSchema),
        defaultValues: baseDefaultValues,
    })

    const { fields: rawMaterialFields, append: appendRawMaterial, remove: removeRawMaterial } = useFieldArray({
        control: form.control,
        name: "rawMaterials",
    })

    const { fields: paperTypeFields, append: appendPaperType, remove: removePaperType } = useFieldArray({
        control: form.control,
        name: "paperTypes",
    })

    const { fields: inkFields, append: appendInk, remove: removeInk } = useFieldArray({
        control: form.control,
        name: "inks",
    })

    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (file: File | null) => {
        if (file) {
            const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "application/zip"]
            const maxSize = 10 * 1024 * 1024 // 10MB

            if (validTypes.includes(file.type) && file.size <= maxSize) {
                setUploadedFile(file)
            } else {
                alert("Invalid file type or size. Please upload a .jpg, .png, .svg, or .zip file under 10MB.")
            }
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        handleFileSelect(file)
    }

    const removeFile = () => {
        setUploadedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + sizes[i]
    }

    async function onSubmit(data: JobTicketFormValues) {
        try {
            setIsLoading(true)
            const payload: CREATE_TICKETS = {
                po_id: data.poNumber ? Number(data.poNumber) : undefined,
                item_code: data.item,
                job_number: data.jobNumber,
                order_received_date: data.orderReceivedDate ? toMySQLDateTime(data.orderReceivedDate) : undefined,
                job_open_date: data.jobOpenDate ? toMySQLDateTime(data.jobOpenDate) : undefined,
                customer_id: data.customer,
                job_name: data.jobName,
                product_type: data.productType,
                quantity: data.quantity ? Number(data.quantity) : undefined,
                completed_qty: data.completed_qty ? Number(data.completed_qty) : undefined,
                wastage: data.wastage,
                packing_date: data.packingDate ? toMySQLDateTime(data.packingDate) : undefined,
                expiry_date: data.expiryDate ? toMySQLDateTime(data.expiryDate) : undefined,
                tc_no: data.tcNo,
                batch_ref: data.batchRef,
                remarks: data.remarks,

                old_plates_quantity: data.oldPlatesQuantity,
                old_plates_status: data.oldPlatesStatus,
                old_plates_remarks: data.oldPlatesRemarks,
                new_plates_quantity: data.newPlatesQuantity,
                new_plates_status: data.newPlatesStatus,
                new_plates_remarks: data.newPlatesRemarks,

                raw_materials: data.rawMaterials,
                inks: data.inks,
                paper_types: data.paperTypes?.map(p => ({
                    ...p,
                    delivery_date: p.delivery_date ? toMySQLDateTime(p.delivery_date) : undefined
                })),

                status: "PENDING",
                create_by: "Admin",
                created_on: new Date(),
            }

            const response = await jobTicketsApi.create(payload)
            console.log(response)

            toast.success("Job Ticket Created Successfully")

            setIsLoading(false)
        } catch (error) {
            console.error("Failed to submit job ticket:", error)
            toast.error("Failed to create job ticket")
        } finally {
            setIsLoading(false)
        }

    }


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [poResponse, customerResponse] = await Promise.all([
                purchaseOrderApi.getAll(),
                CustomerApi.getAll()
            ]);

            setPurchaseOrderData(poResponse.data);
            setCustomerData(customerResponse.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedPoId = form.watch("poNumber");
    const selectedPoItems = selectedPoDetails?.po_items ?? [];

    useEffect(() => {
        const fetchPoDetails = async () => {
            if (!selectedPoId) {
                setSelectedPoDetails(null);
                return;
            }
            try {
                setFetchingDetails(true);
                const response = await purchaseOrderApi.getById(selectedPoId);
                if (response.status === 200) {
                    const po = response.data;
                    console.log("po", po)
                    setSelectedPoDetails(po);

                    if (po.customer) {
                        // Find the customer in our list to ensure we have the right value
                        // or just use the ID if we decide to use IDs as values
                        form.setValue("customer", String(po.customer.customer_id));
                    }
                    if (po.po_date) {
                        form.setValue("orderReceivedDate", new Date(po.po_date));
                    }
                    form.setValue("tcNo", po.TC_E_PR_No);
                    form.setValue("batchRef", po.batch_ref);
                }
            } catch (err) {
                console.error("Error fetching PO details", err);
            } finally {
                setFetchingDetails(false);
            }
        };

        fetchPoDetails();
        form.setValue("item", "");
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

    useEffect(() => {
        fetchCustomerData();
    }, []);
    const fetchCustomerData = async () => {
        try {
            setIsLoading(true);
            const response = await CustomerApi.getAll();
            console.log(response)

            if (response.status === 200) {
                setCustomerData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch inventory');
        } finally {
            setIsLoading(false);
        }
    };





    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Create Job Ticket"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Job Ticket", href: "/job-ticket" },

                ]}
            />


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-0">
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/job-ticket")} disabled={isLoading}>Cancel</Button>
                        <Button size="lg" type="submit" className="bg-black text-white" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                    <Card className={cn("w-full shdow-sm hover:shadow-md transition-shadow flex flex-col")}>
                        <CardHeader className="flex flex-col gap-[0.5px]">
                            <h3 className="text-md font-medium mb-2">Job Ticket Details</h3>
                            <p className="text-xs text-muted-foreground mb-4">Enter Job Ticket Details</p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("poNumber", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>PO Number</FormLabel>
                                        <Combobox
                                            items={purchaseOrderData.map(po => ({ value: String(po.po_id), label: String(po.po_id) }))}
                                            value={field.value || ""}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.setValue("item", "");
                                            }}
                                            placeholder="Select PO Number"
                                            searchPlaceholder="Search PO..."
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
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                const selectedItem = selectedPoItems.find((i: any) => i.item_code === value);
                                                if (selectedItem) {
                                                    form.setValue("quantity", String(selectedItem.quantity));
                                                    form.setValue("jobName", selectedItem.description);
                                                }
                                            }}
                                            placeholder={fetchingDetails ? "Loading items..." : selectedPoItems.length > 0 ? "Select Item" : "No items found"}
                                            disabled={!selectedPoId || fetchingDetails}
                                            searchPlaceholder="Search item..."
                                            emptyMessage={fetchingDetails ? "Loading..." : "No items found in this PO"}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("jobNumber", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Number</FormLabel>
                                        <FormControl><Input placeholder="MPL/8450/25/TIEP" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("orderReceivedDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Received Date</FormLabel>
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
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                ))}


                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderFormField("jobOpenDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Open Date</FormLabel>
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
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                            </PopoverContent>
                                        </Popover>
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
                                            onValueChange={field.onChange}
                                            placeholder="Select Customer"
                                            searchPlaceholder="Search customer..."
                                        />
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("jobName", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Name</FormLabel>
                                        <FormControl><Input placeholder="Enter Job Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>
                            {/* Product Details */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {renderFormField("productType", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Type <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Product Type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Object.values(PRODUCT_TYPES).map((productType) => (
                                                    <SelectItem key={productType} value={productType}>
                                                        {productType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("quantity", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input type="number" placeholder="Enter Quantity" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("completed_qty", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Completed Quantity <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input type="number" placeholder="Enter Completed Quantity" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("wastage", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wastage %</FormLabel>
                                        <FormControl><Input type="number" placeholder="Enter Wastage" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            <div>
                                {paperTypeFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2 mb-2 items-start">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                            {renderFormField(`paperTypes.${index}.paper_type`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Paper Type <span className="text-red-500">*</span></FormLabel>
                                                    <PaperTypeCombobox value={field.value} onChange={field.onChange} />
                                                    <FormMessage className="min-h-[20px]" />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`paperTypes.${index}.coating`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Coating <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Coating" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {Object.values(COATING_TYPES).map((coating) => (
                                                                <SelectItem key={coating} value={coating}>
                                                                    {coating}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="min-h-[20px]" />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`paperTypes.${index}.delivery_date`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Delivery Date</FormLabel>
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
                                                            <Calendar mode="single" captionLayout="dropdown" selected={field.value} onSelect={field.onChange} />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage className="min-h-[20px]" />
                                                </FormItem>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2 items-start pt-6">
                                            <Button type="button" variant="outline" size="icon" onClick={() => { }}><Edit2 className="h-4 w-4" /></Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removePaperType(index)}
                                                disabled={paperTypeFields.length <= 1} // Disable if only one item
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                    </div>
                                ))}
                                <div className="flex justify-end mt-2">
                                    <Button type="button" onClick={() => appendPaperType({ paper_type: "", coating: "", delivery_date: undefined })} className="bg-black text-white hover:bg-gray-800">Add More</Button>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {renderFormField("packingDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Packing Date</FormLabel>
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
                                {renderFormField("expiryDate", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
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
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">

                                {renderFormField("tcNo", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>TC No</FormLabel>
                                        <FormControl><Input placeholder="Enter TC No" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                                {renderFormField("batchRef", ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch Ref</FormLabel>
                                        <FormControl><Input placeholder="Enter Batch Ref" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ))}
                            </div>

                            {renderFormField("remarks", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl><Textarea placeholder="Enter Remarks" className="resize-none" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}

                            {/* CTP Plates */}
                            <div>
                                <h3 className="text-sm font-medium mb-2">CTP Plates</h3>
                                <p className="text-xs text-muted-foreground mb-4">Select the CTP Plates for Old and New Plates.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3  gap-4 mb-2">

                                    {renderFormField("oldPlatesQuantity", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Plates Quantity</FormLabel>
                                            <FormControl><Input type="number" placeholder="Quantity" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                    {renderFormField("oldPlatesStatus", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Plates Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.values(PLATES_STATUS).map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
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
                                            <FormControl><Input placeholder="Remarks" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {renderFormField("newPlatesQuantity", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Plates Quantity</FormLabel>
                                            <FormControl><Input type="number" placeholder="Quantity" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                    {renderFormField("newPlatesStatus", ({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Plates Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.values(PLATES_STATUS).map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
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
                                            <FormControl><Input placeholder="Remarks" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ))}
                                </div>
                            </div>

                            {/* Raw Material Section with updated delete logic */}
                            <div>
                                <h3 className="text-sm font-medium">Raw Material</h3>
                                <p className="text-xs text-muted-foreground mb-4">Select the Raw Material that best fits your needs.</p>

                                {rawMaterialFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 mb-2">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                            {renderFormField(`rawMaterials.${index}.item`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Raw Material</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select an item" /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="rm1">Material 1</SelectItem></SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`rawMaterials.${index}.quantity`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Enter Quantity" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`rawMaterials.${index}.status`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select an Status" /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="s1">Status 1</SelectItem></SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`rawMaterials.${index}.remarks`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                                    <FormControl><Input placeholder="Enter Remarks" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2 items-end pb-2">
                                            <Button type="button" variant="outline" size="icon" onClick={() => { }}><Edit2 className="h-4 w-4" /></Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeRawMaterial(index)}
                                                disabled={rawMaterialFields.length <= 1} // Disable if only one item
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-end mt-2">
                                    <Button type="button" onClick={() => appendRawMaterial({ item: "", quantity: "", status: "", remarks: "" })} className="bg-black text-white hover:bg-gray-800">Add More</Button>
                                </div>
                            </div>

                            {/* Ink Section with updated delete logic */}
                            <div>
                                <h3 className="text-sm font-medium">Ink</h3>
                                <p className="text-xs text-muted-foreground mb-4">Select the Ink that best fits your needs.</p>

                                {inkFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 mb-2">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                            {renderFormField(`inks.${index}.ink`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Ink</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder={field.value || "Select Ink"} /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Black">Black</SelectItem>
                                                            <SelectItem value="Cyan">Cyan</SelectItem>
                                                            <SelectItem value="Magenta">Magenta</SelectItem>
                                                            <SelectItem value="Yellow">Yellow</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`inks.${index}.quantity`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Enter Quantity" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`inks.${index}.status`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select an Status" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {Object.values(INK_STATUS).map((status) => (
                                                                <SelectItem key={status} value={status}>
                                                                    {status}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                            {renderFormField(`inks.${index}.remarks`, ({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                                    <FormControl><Input placeholder="Enter Remarks" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2 items-end pb-2">
                                            <Button type="button" variant="outline" size="icon" onClick={() => { }}><Edit2 className="h-4 w-4" /></Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeInk(index)}
                                                disabled={inkFields.length <= 1} // Disable if only one item
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-end mt-2">
                                    <Button type="button" onClick={() => appendInk({ ink: "", quantity: "", status: "", remarks: "" })} className="bg-black text-white hover:bg-gray-800">Add More</Button>
                                </div>
                            </div>

                            {/* Artwork */}
                            <div>
                                <h3 className="text-sm font-medium mb-2">Artwork</h3>
                                <div
                                    className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <CloudUpload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">
                                        Drag your file(s) or <span className="font-bold underline">browse</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Max 10 MB files are allowed</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.svg,.zip"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 mb-3">Only support .jpg, .png and .svg and zip files</p>

                                {/* File Preview */}
                                {uploadedFile && (
                                    <div className="mt-4 border rounded-lg p-3 flex items-center justify-between bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded">
                                                <FileArchive className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{uploadedFile.name}</span>
                                                <span className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <X className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </form>
            </Form>
        </div>
    )
}

export default CreateJobTicket;