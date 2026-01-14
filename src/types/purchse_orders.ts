export interface PURCHASE_ORDER {
    po_id: number,
    quote_id: number,
    po_type_id: number,
    batch_ref: string,
    po_date: Date,
    delivery_date: Date,
    TC_E_PR_No: string,
    approved_on: Date,
    approved_by: string,
    created_on: Date,
    created_by: string,
    updated_on: Date,
    updated_by: string,
    status: string,
    customer_po: string

}