
import * as z from "zod"
export const inventoryManagementScheme = z.object({
    item_category: z.string().min(1, "Item Category Required"),
    item_sub_category: z.string().min(1, "Item Sub Category Required"),
    item_name: z.string().min(1, "Item Name Required"),
    size: z.string().optional(),
    width: z.string().min(1, "Width Required"),
    height: z.string().min(1, "Height Required"),
    quantity: z.number().min(0, "Item Quantity Required"),
    unit_of_measure: z.string().min(1, "Item UOM Required"),
    reorder_level: z.string().min(1, "Item Recoder Level Required"),
    status: z.string().min(1, "Item Status Required"),
    remarks: z.string().optional(),
    created_by: z.string().optional(),
    updated_by: z.string().optional(),
})
