"use client"

import { SubmitHandler, useFieldArray, useForm, FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, CloudUpload, Plus, Trash2, Edit2, X, FileArchive } from "lucide-react" // Import icons
import { format } from "date-fns"
import { useState, useRef, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { COATING_TYPES, INK_STATUS, JobTicketStatus, PRODUCT_TYPES, PurchaseOrderType } from "@/config/enum"
import { PURCHASE_ORDER, PURCHASE_ORDER_ID } from "@/modules/purchase-order/types"
import { purchaseOrderApi } from "@/modules/purchase-order/api"
import { CustomerApi } from "@/modules/customer/api"
import { CUSTOMER } from "@/modules/customer/types"
import { jobTicketsApi } from "@/modules/job-tickets/api"
import { ALL_TICKETS, CREATE_TICKETS } from "@/modules/job-tickets/types"
import { toast } from "sonner"
import { toMySQLDateTime } from "@/hooks/sql-date-time"
import { inventoryApi } from "@/modules/inventory/api"
import { GET_ALL_INVENTORY } from "@/modules/inventory/types"
import { useDispatch } from "react-redux"
import { setInventoryList as setReduxInventoryList } from "@/store/inventory-slice"
import { AppDispatch } from "@/store/store"

type JobTicketFormValues = z.infer<typeof jobTicketSchema>

interface CreateJobTicketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultValues?: Partial<JobTicketFormValues>
    initialPoId?: string
    onSuccess?: () => void
}

import { PaperTypeCombobox } from "./paper-type-combobox"
import { Combobox } from "@/components/shared/combobox"
import { getUser } from "@/lib/auth"

export function CreateJobTicketDialog({ open, onOpenChange, initialPoId, onSuccess }: CreateJobTicketDialogProps) {

    const [purchaseOrderData, setPurchaseOrderData] = useState<PURCHASE_ORDER[]>([]);
    const [customerData, setCustomerData] = useState<CUSTOMER[]>([]);
    const [selectedPoDetails, setSelectedPoDetails] = useState<PURCHASE_ORDER_ID | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)
    const [existingTickets, setExistingTickets] = useState<ALL_TICKETS[]>([])
    const [inventoryList, setInventoryList] = useState<GET_ALL_INVENTORY[]>([]);
    const dispatch = useDispatch<AppDispatch>();

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
        completed_qty: "",
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
        inks: [
            { ink: "Black", quantity: "", status: "", remarks: "" },
            { ink: "Cyan", quantity: "", status: "", remarks: "" },
            { ink: "Magenta", quantity: "", status: "", remarks: "" },
            { ink: "Yellow", quantity: "", status: "", remarks: "" },
        ],
        paperTypes: [{ paper: "", coating: "", delivery_date: new Date(), rawMaterials: [{ item_id: undefined, material_name: "", material_type: "", size: "", material_description: "", quantity: 0, status: "", remarks: "" }] }],
    }

    const form = useForm<JobTicketFormValues>({
        resolver: zodResolver(jobTicketSchema),
        defaultValues: baseDefaultValues,
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
            setLoading(true)
            const payload: CREATE_TICKETS = {
                po_id: data.poNumber ? Number(data.poNumber) : undefined,
                job_item: data.item,
                job_number: `MPL/####/YY/${PurchaseOrderType[Number(selectedPoDetails?.po_type_id)]}`,
                order_received_date: toMySQLDateTime(data.orderReceivedDate || new Date()),
                job_open_date: toMySQLDateTime(data.jobOpenDate || new Date()),
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
                description: data.remarks,
                artwork: "",

                old_plate_quantity: data.oldPlatesQuantity ? Number(data.oldPlatesQuantity) : undefined,
                old_plate_status: data.oldPlatesStatus,
                old_plate_remarks: data.oldPlatesRemarks,
                new_plate_quantity: data.newPlatesQuantity ? Number(data.newPlatesQuantity) : undefined,
                new_plate_status: data.newPlatesStatus,
                new_plate_remarks: data.newPlatesRemarks,

                inks: data.inks,
                paperCoating: data.paperTypes?.map(p => ({
                    paper: p.paper,
                    coating: p.coating,
                    delivery_date: p.delivery_date ? toMySQLDateTime(p.delivery_date) : undefined,
                    materials: p.rawMaterials?.map(rm => ({
                        item_id: rm.item_id,
                        material_type: rm.material_type,
                        material_name: rm.material_name,
                        size: rm.size,
                        material_description: rm.material_description,
                        quantity: rm.quantity,
                        status: rm.status,
                        remarks: rm.remarks,
                    })),
                })),

                status: JobTicketStatus.CREATED,
                created_by: user?.email || "admin@admin.com",
                created_on: new Date(),
            }

            const response = await jobTicketsApi.create(payload)

            toast("Job Ticket Created Successfully")

            if (data.addAnotherJob) {
                form.reset(
                    {
                        ...baseDefaultValues,
                        addAnotherJob: true,
                    },
                    {
                        keepDefaultValues: false,
                    }
                )
                form.clearErrors()
            } else {
                onOpenChange(false)
                onSuccess?.()

                form.reset(
                    {
                        ...baseDefaultValues,
                        addAnotherJob: false,
                    },
                    {
                        keepDefaultValues: false,
                    }
                )
                form.clearErrors()
            }
        } catch (error: any) {
            toast("Failed to Create Job Ticket", {
                description: error?.response?.data?.message ||
                    "An error occurred while creating the job ticket. Please try again."
            });
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchData();
        getInventoryList();
        const userData = getUser()
        if (userData) {
            setUser({
                name: userData.name || "User",
                email: userData.email,
                avatar: "",
            })
        }
    }, []);

    const getInventoryList = async () => {
        try {
            setLoading(true);
            const response = await inventoryApi.getAll();

            if (response.status === 200) {
                setInventoryList(response.data);
                dispatch(setReduxInventoryList(response.data));
            }
        } catch (error) {
            console.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [poResponse, customerResponse] = await Promise.all([
                purchaseOrderApi.getAll(),
                CustomerApi.getAll()
            ]);

            setPurchaseOrderData(poResponse.data);
            setCustomerData(customerResponse.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        if (open && initialPoId) {
            form.setValue("poNumber", initialPoId);
        }
    }, [open, initialPoId, form]);



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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-full p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-semibold">Job Details</DialogTitle>
                        {/* Optional: Add close button or other header actions */}
                    </div>

                </DialogHeader>



                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6 px-6 pb-0">
                        <h3 className="text-sm font-medium mb-2">Update Fields to add a Job ticket</h3>
                        <p className="text-xs text-muted-foreground mb-4">Complete this form to update or create a job ticket.</p>
                        {/* General Info */}
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
                                        items={[
                                            ...customerData.map(cust => ({ value: String(cust.customer_id), label: cust.company_name })),
                                            ...(field.value && !customerData.some(c => String(c.customer_id) === field.value) ? [{
                                                value: field.value,
                                                label: selectedPoDetails?.customer?.name || field.value
                                            }] : [])
                                        ]}
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
                        <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
                            {renderFormField("productType", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Type <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                    <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input type="number" placeholder="Enter Quantity" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            ))}

                            {renderFormField("completed_qty", ({ field }) => (
                                <FormItem>
                                    <FormLabel>Completed Quantity</FormLabel>
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
                            <h3 className="text-sm font-medium mb-2">Paper & Raw Material</h3>
                            <p className="text-xs text-muted-foreground mb-4">Select the Paper Type and corresponding Raw Material for this job.</p>

                            {paperTypeFields.map((field, index) => {
                                const rawMaterials = form.watch(`paperTypes.${index}.rawMaterials`) || [];
                                return (
                                    <div key={field.id} className="border rounded-lg p-4 mb-4 bg-muted/20">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-semibold">Set {index + 1}</h4>
                                            <div className="flex space-x-2">
                                                <Button type="button" variant="outline" size="icon" onClick={() => { }}><Edit2 className="h-4 w-4" /></Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removePaperType(index)}
                                                    disabled={paperTypeFields.length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <FormField control={form.control} name={`paperTypes.${index}.paper`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Paper Type <span className="text-red-500">*</span></FormLabel>
                                                    <PaperTypeCombobox
                                                        value={field.value}
                                                        onChange={(val) => {
                                                            field.onChange(val);
                                                            if (val) {
                                                                const selectedPaper = inventoryList.find(item =>
                                                                    `${item.item_sub_category} ${item.item_name}` === val
                                                                );
                                                                if (selectedPaper) {
                                                                    const rawMaterials = form.getValues(`paperTypes.${index}.rawMaterials`);
                                                                    rawMaterials?.forEach((_, rmIndex) => {
                                                                        form.setValue(`paperTypes.${index}.rawMaterials.${rmIndex}.size`, selectedPaper.size);
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <FormMessage className="min-h-[20px]" />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`paperTypes.${index}.coating`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Coating <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                            )} />
                                            <FormField control={form.control} name={`paperTypes.${index}.delivery_date`} render={({ field }) => (
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
                                            )} />
                                        </div>

                                        {/* Raw Materials for this Paper Type */}
                                        <h5 className="text-xs font-medium mb-2 mt-2">Raw Materials</h5>
                                        {rawMaterials.map((_rm: any, rmIndex: number) => (
                                            <div key={rmIndex} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
                                                <FormField control={form.control} name={`paperTypes.${index}.rawMaterials.${rmIndex}.size`} render={({ field }) => {
                                                    const selectedPaperName = form.watch(`paperTypes.${index}.paper`);
                                                    const filteredInventory = inventoryList.filter(item =>
                                                        `${item.item_sub_category} ${item.item_name}` === selectedPaperName
                                                    );

                                                    return (
                                                        <FormItem>
                                                            <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Raw Material</FormLabel>
                                                            <Select
                                                                onValueChange={(val) => {
                                                                    field.onChange(val);
                                                                    const selectedMaterial = filteredInventory.find(item => item.size === val);
                                                                    if (selectedMaterial) {
                                                                        form.setValue(`paperTypes.${index}.rawMaterials.${rmIndex}.item_id`, selectedMaterial.item_id);
                                                                        form.setValue(`paperTypes.${index}.rawMaterials.${rmIndex}.material_type`, selectedMaterial.item_sub_category);
                                                                        form.setValue(`paperTypes.${index}.rawMaterials.${rmIndex}.material_name`, selectedMaterial.item_name);
                                                                    }
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Size" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {filteredInventory.map((item) => (
                                                                        <SelectItem key={item.item_id} value={item.size}>
                                                                            {item.size}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className="min-h-[20px]" />
                                                        </FormItem>
                                                    )
                                                }} />
                                                <FormField control={form.control} name={`paperTypes.${index}.rawMaterials.${rmIndex}.quantity`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                        <FormControl><Input type="number" placeholder="Enter Quantity" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name={`paperTypes.${index}.rawMaterials.${rmIndex}.status`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Status</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                                            <SelectContent><SelectItem value="s1">Status 1</SelectItem></SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name={`paperTypes.${index}.rawMaterials.${rmIndex}.remarks`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={rmIndex !== 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                                        <FormControl><Input placeholder="Enter Remarks" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <div className="flex items-end pb-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => {
                                                            const current = form.getValues(`paperTypes.${index}.rawMaterials`) || [];
                                                            if (current.length > 1) {
                                                                form.setValue(`paperTypes.${index}.rawMaterials`, current.filter((_: any, i: number) => i !== rmIndex));
                                                            }
                                                        }}
                                                        disabled={rawMaterials.length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-end mt-1 mb-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const current = form.getValues(`paperTypes.${index}.rawMaterials`) || [];
                                                    form.setValue(`paperTypes.${index}.rawMaterials`, [...current, { item_id: undefined, material_name: "", material_type: "", size: "", material_description: "", quantity: 0, status: "", remarks: "" }]);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Add Material
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex justify-end mt-2">
                                <Button type="button" onClick={() => appendPaperType({ paper: "", coating: "", delivery_date: undefined, rawMaterials: [{ item_id: undefined, material_name: "", material_type: "", size: "", material_description: "", quantity: 0, status: "", remarks: "" }] })} className="bg-primary text-white hover:bg-primary/90">Add More Sets</Button>
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
                                    <FormLabel>TC/E/PR/No</FormLabel>
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
                                            <SelectContent><SelectItem value="s1">Status 1</SelectItem></SelectContent>
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
                                            <SelectContent><SelectItem value="s1">Status 1</SelectItem></SelectContent>
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


                        {/* Ink Section with updated delete logic */}
                        <div>
                            <h3 className="text-sm font-medium">Ink</h3>
                            <p className="text-xs text-muted-foreground mb-4">Select the Ink that best fits your needs.</p>

                            {inkFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                        <FormField control={form.control} name={`inks.${index}.ink`} render={({ field }) => (
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
                                        )} />
                                        <FormField control={form.control} name={`inks.${index}.quantity`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                <FormControl><Input type="number" placeholder="Enter Quantity" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`inks.${index}.status`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select an Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {Object.entries(INK_STATUS).map(([key, value]) => (
                                                            <SelectItem key={key} value={value}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`inks.${index}.remarks`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                                <FormControl><Input placeholder="Enter Remarks" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
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
                                <Button type="button" onClick={() => appendInk({ ink: "", quantity: "", status: "", remarks: "" })} className="bg-primary text-white hover:bg-primary/90">Add More</Button>
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


                        <div className="flex items-center space-x-2 mb-3">
                            <Checkbox id="add-another-job" onCheckedChange={(checked) => form.setValue('addAnotherJob', checked as boolean)} />
                            <label
                                htmlFor="add-another-job"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Add Another Job
                            </label>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t flex items-center justify-end sm:justify-end w-full mt-6">
                            <div className="flex space-x-2 ">
                                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button type="submit" className="bg-primary text-white">Save</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

