import * as z from "zod"
import { PurchaseOrderType } from "./enum"

//Create Purchase Order
export const purchaseOrderScheme = z.object({
    customer: z.string().optional(),
    customerName: z.string().optional(),
    customerAddress: z.string().optional(),
    customerEmail: z.string().optional(),

    purchaseOrderNo: z.string().min(1, "Purchase Order No is required"),
    quotationId: z.string().optional(),
    tceprNo: z.string().optional(),
    purchaseOrderType: z.nativeEnum(PurchaseOrderType, {
        error: "Purchase Order Type is required",
    }),
    batchRef: z.string().optional(),
    poDate: z.date({
        error: "PO Date is required",
    }),
    itemDetails: z.array(z.object({
        itemCode: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity is required"),
        unit: z.string().min(1, "Unit of Measure is required"),
        price: z.number().min(1, "Price is required")
    })).min(1),

})


// Job Ticket 
export const jobTicketSchema = z.object({
    poNumber: z.string().optional(),
    item: z.string().optional(),
    orderReceivedDate: z.date().optional(),
    jobNumber: z.string().optional(),
    jobOpenDate: z.date().optional(),
    customer: z.string().optional(),
    jobName: z.string().optional(),
    productType: z.string().min(1, "Product Type is required"),
    quantity: z.string().min(1, "Quantity is required"),
    wastage: z.string().optional(),
    packingDate: z.date().optional(),
    expiryDate: z.date().optional(),
    poNo: z.string().optional(),
    tcNo: z.string().optional(),
    batchRef: z.string().optional(),
    remarks: z.string().optional(),
    addAnotherJob: z.boolean().default(false).optional(),


    // CTP Plates
    oldPlatesQuantity: z.string().optional(),
    oldPlatesStatus: z.string().optional(),
    oldPlatesRemarks: z.string().optional(),
    newPlatesQuantity: z.string().optional(),
    newPlatesStatus: z.string().optional(),
    newPlatesRemarks: z.string().optional(),

    // Dynamic Lists
    rawMaterials: z.array(z.object({
        item: z.string().optional(),
        quantity: z.string().optional(),
        status: z.string().optional(),
        remarks: z.string().optional(),
    })).optional(),
    inks: z.array(z.object({
        ink: z.string().optional(),
        quantity: z.string().optional(),
        status: z.string().optional(),
        remarks: z.string().optional(),
    })).optional(),

    //Paper Types
    paperTypes: z.array(z.object({
        paper_type: z.string().min(1, "Paper Type is required"),
        coating: z.string().min(1, "Coating is required"),
        delivery_date: z.date().optional(),
    })).min(1),
})


export const customerSchema = z.object({
    customerName: z.string().optional(),
    companyName: z.string().min(1, "Company name is required"),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    creditPeriod: z.string().optional(),
    SVAT_reg_no: z.string().optional(),
    VAT_reg_no: z.string().optional(),
    logoUrl: z.string().optional(),
    contactPerson: z.string().optional(),
    contactPersonEmail: z.string().email("Invalid contact person email").optional(),
    contactPersonPhone: z.string().optional(),

})