import * as z from "zod"

export const supplierSchema = z.object({
    customer_type: z.string().optional(),
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
    contactPersons: z.array(z.object({
        id: z.number().optional(),
        name: z.string().min(1, "Name is required"),
        email: z.string()
            .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address format")
            .or(z.literal(""))
            .optional(),
        phone: z.string().optional(),
    })).min(1, "At least one contact person is required"),
    created_by: z.string().optional(),
    updated_by: z.string().optional(),
    status: z.string().optional(),
})
