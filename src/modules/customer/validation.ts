import * as z from "zod"

export const customerSchema = z.object({
    customer_type: z.string().min(1, "Customer type is required"),
    companyName: z.string().min(1, "Company name is required"),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address format")
        .or(z.literal(""))
        .optional(),
    creditPeriod: z.string().optional(),
    vat_type: z.string().optional(),
    vat_no: z.string().optional(),
    logoUrl: z.string().optional(),
    contactPerson: z.string().optional(),
    contactPersonEmail: z.string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address format")
        .or(z.literal(""))
        .optional(),
    contactPersonPhone: z.string().optional(),
    created_by: z.string().optional(),
    updated_by: z.string().optional(),
    status: z.string().optional(),
})
