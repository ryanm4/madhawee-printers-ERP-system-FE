import { z } from "zod";

export const grnItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  rate: z.coerce.number().min(0, "Rate must be at least 0"),
  amount: z.coerce.number().min(0, "Amount must be at least 0"),
});

export const grnSchema = z.object({
  releated_po: z.string().min(1, "Related PO is required"),
  received_date: z.date().min(new Date(0), "Received date is required"),
  supplier_name: z.string().min(1, "Supplier name is required"),
  stock_location: z.string().min(1, "Stock location is required"),
  payee_name: z.string().optional(),
  payment_method: z.enum(["CASH", "CARD"]),
  currency: z.string().min(1, "Currency is required"),
  supplier_invoice_no: z.string().min(1, "Invoice number is required"),
  remarks: z.string().optional(),
  items: z.array(grnItemSchema).min(1, "At least one item is required"),
});
