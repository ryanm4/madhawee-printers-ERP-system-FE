import * as z from "zod"
export const dispatchInvoiceScheme = z.object({
    job_id: z.string().min(1, "Job ID is required"),
    customer_name: z.string().optional(),
    customer_address: z.string().optional(),
    customer_phone: z.number().optional(),
    delivery_address: z.string().optional(),
    dispatch_note: z.string().optional(),
    dispatch_date: z.date().optional(),
    dispatch_quantity: z.number().optional(),
    dispatch_bundles_qty: z.number().optional(),
    dispatch_description: z.string().optional(),

})


