import * as z from "zod"
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
    completed_qty: z.string().optional(),
    wastage: z.string().optional(),
    packingDate: z.date().optional(),
    expiryDate: z.date().optional(),
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
    inks: z.array(z.object({
        ink: z.string().optional(),
        quantity: z.string().optional(),
        status: z.string().optional(),
        remarks: z.string().optional(),
    })).optional(),

    //Paper Types with nested Raw Materials
    paperTypes: z.array(z.object({
        paper: z.string().min(1, "Paper Type is required"),
        coating: z.string().min(1, "Coating is required"),
        delivery_date: z.date().optional(),
        rawMaterials: z.array(z.object({
            item_id: z.number().optional(),
            material_name: z.string().optional(),
            material_type: z.string().optional(),
            size: z.string().optional(),
            material_description: z.string().optional(),
            quantity: z.number().optional(),
            status: z.string().optional(),
            remarks: z.string().optional(),
        })).optional(),
    })).min(1),
})