import { getUser } from "@/lib/auth";
import { quotationApi } from "./api";
import type { QUOTATIONS, UPDATE_QUOTATION_REQUEST } from "./types";

/** Save a new status on a quotation, keeping everything else as it is */
export async function updateQuotationStatus(quotation: QUOTATIONS, status: string) {
  const currentUser = getUser();
  const taxId = Number(quotation.tax_type_id);
  const payload: UPDATE_QUOTATION_REQUEST = {
      quote_id: quotation.quote_id,
      customer_id: Number(quotation.customer_id),
      type_id: Number(quotation.type_id),
      delivery_days: quotation.delivery_days,
      validity_period: quotation.validity_period,
      tax_type_id: taxId,
      currency: quotation.currency,
      contact_person: quotation.contact_person ?? null,
      marketing_person: quotation.marketing_person ?? null,
      notes: quotation.notes || "",
      status,
      // Only include tax totals if tax is applied
      ...(taxId !== 2 && {
          sub_total: quotation.sub_total,
          total_without_tax: quotation.total_without_tax,
      }),
      no_of_items: quotation.no_of_items,
      net_total: quotation.net_total,
      updated_by: currentUser?.name ?? "User",
      updated_on: new Date(),
      items: (quotation.items ?? []).map((item) => ({
          item_id: item.item_id,
          item_category: item.item_category,
          item_qty: String(item.item_qty),
          item_description: item.item_description,
          item_unit_price: String(item.item_unit_price),
          item_unit_discount: String(item.item_unit_discount || "0"),
          item_total_price: String(item.item_total_price),
      })),
  };
  await quotationApi.update(quotation.quote_id, payload);
}
