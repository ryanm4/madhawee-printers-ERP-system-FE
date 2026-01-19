import * as z from "zod"
export const customerSchema = z.object({
    customer_type: z.string().optional(),
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