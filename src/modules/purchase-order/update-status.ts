import { getUser } from "@/lib/auth";
import { purchaseOrderApi } from "./api";
import type { PURCHASE_ORDER_ID } from "./types";

/** Save a new status on a purchase order, keeping everything else as it is */
export async function updatePurchaseOrderStatus(data: PURCHASE_ORDER_ID, status: string) {
  const id = data.po_id;
  const payload = {
    quote_id: Number(data.quote_id),
    customer_id: data.customer ? Number(data.customer.customer_id) : 0,
    po_type_id: Number(data.po_type_id),
    batch_ref: data.batch_ref,
    po_date: data.po_date,
    delivery_date: data.delivery_date,
    TC_E_PR_No: data.TC_E_PR_No,
    updated_by: getUser()?.name || "User",
    status: status,
    customer_po: String(data.customer_po),
    currency: data.currency,
    sales_ref: data.sales_ref,
    po_items: (data.po_items || []).map((item) => ({
      item_code: item.item_code,
      description: item.description,
      quantity: String(item.quantity),
      uom: item.uom,
      price: String(item.price),
    })),
  };
  await purchaseOrderApi.update(id, payload);
}
