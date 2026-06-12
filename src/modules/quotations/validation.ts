
import * as z from "zod"

export const quotationItemsSchema = z.object({
    item_id: z.number().optional(),
    item_category: z.string().optional(),
    item_qty: z.string().min(1, "Item quantity required"),
    item_description: z.string().optional(),
    item_unit_price: z.string().min(1, "Unit price required"),
    item_unit_discount: z.string().min(1, "Unit discount required"),
    item_total_price: z.string().min(1, "Total price required"),
});


export const createQuotationSchema = z.object({
    customer_id: z.number().min(1, "Customer is required"),
    type_id: z.number().min(1, "Quotation type is required"),
    delivery_days: z.string().min(1, "Delivery days required"),
    validity_period: z.string().regex(/^\d+$/, "Validity period must be a number").min(1, "Validity period required"),
    tax_type_id: z.number().min(0, "Tax type is required"),
    currency: z.string().min(1, "Currency required"),
    contact_person: z.string().optional(),
    marketing_person: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().min(1, "Status required"),

    sub_total: z.string().optional(),
    no_of_items: z.string().min(1, "Number of items required"),
    total_without_tax: z.string().optional(),
    net_total: z.string().min(1, "Net total required"),

    created_by: z.string().min(1, "Created by required"),
    updated_by: z.string().min(1, "Updated by required"),

    items: z.array(quotationItemsSchema).min(1, "At least one item required"),
});

