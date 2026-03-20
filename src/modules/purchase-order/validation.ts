import { PurchaseOrderType } from "@/config/enum";
import * as z from "zod";

//Create Purchase Order
export const purchaseOrderScheme = z.object({
    customer: z.string().optional(),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    customerEmail: z.string().optional(),

    customer_po: z.string().min(1, "Purchase Order No is required"),
    quotationId: z.string().optional(),
    tceprNo: z.string().optional(),
    purchaseOrderType: z.nativeEnum(PurchaseOrderType),
    batchRef: z.string().optional(),
    poDate: z.date(),

    itemDetails: z
        .array(
            z.object({
                itemCode: z.string().optional(),
                description: z.string().min(1, "Description is required"),
                quantity: z.string().min(1, "Quantity is required"),
                unit: z.string().min(1, "Unit of Measure is required"),
                price: z.string().min(1, "Price is required"),
            })
        )
        .min(1),
});
