import * as z from "zod";

export const ReportSchema = z.object({
    reportType: z.string().min(1, "reportType is required"),
    filters: z.object({
        fromDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "fromDate must be YYYY-MM-DD"),
        toDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "toDate must be YYYY-MM-DD"),

        // optional filters
        customer_id: z.number().int().positive().optional(),
        status: z.string().optional(),
        product_type: z.string().optional(),
    }),
});