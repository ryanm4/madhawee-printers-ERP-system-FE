import * as z from "zod"
export const dispatchInvoiceScheme = z.object({
    job_id: z.union([z.string(), z.number()]).refine(val => String(val).length > 0, "Job ID is required"),
    customer_name: z.string().optional(),
    customer_address: z.string().optional(),
    customer_phone: z.string().optional(),
    delivery_address: z.string().optional(),
    dispatch_note: z.string().optional(),
    dispatch_date: z.date().optional(),
    dispatch_quantity: z.string().optional(),
    dispatch_bundles_qty: z.string().optional(),
    dispatch_description: z.string().optional(),
    customer_id: z.string().optional(),
})


