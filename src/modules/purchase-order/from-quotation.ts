import { PRODUCT_TYPES, PurchaseOrderType, QuotationTaxType } from "@/config/enum";
import { CUSTOMER } from "@/modules/customer/types";
import { QUOTATIONS } from "@/modules/quotations/types";

/** The purchase order form fields a quotation can fill in */
export function purchaseOrderFromQuotation(quote: QUOTATIONS, customers: CUSTOMER[]) {
  const productTypes = Object.values(PRODUCT_TYPES) as string[];
  const customerId = quote.customer_id ? String(quote.customer_id) : "";
  const customer = customers.find((c) => String(c.customer_id) === customerId);

  return {
    customer: customerId,
    customerAddress: quote.customer_address || customer?.address || "",
    customerPhone: quote.customer_phone || customer?.phone || "",
    customerEmail: quote.customer_email || customer?.email || "",
    currency: quote.currency || undefined,
    salesRef: quote.marketing_person || undefined,
    purchaseOrderType:
      quote.tax_type_id === QuotationTaxType.TIEP ? PurchaseOrderType.TIEP : PurchaseOrderType.NON_TIEP,
    itemDetails: (quote.items ?? []).map((item) => ({
      unit: productTypes.indexOf(item.item_category) + 1,
      description: item.item_description ?? "",
      quantity: String(item.item_qty ?? ""),
      price: String(item.item_unit_price ?? ""),
    })),
  };
}
