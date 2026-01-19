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
    po_items: PO_ITEMS[]

}
export interface PO_ITEMS {
    po_id: number,
    item_code: string,
    description: string,
    quantity: number,
    uom: string,
    price: number
}

export interface CREATE_PURCHASE_ORDER {
    quote_id: string;
    customer_id: number;
    po_type_id: number;
    batch_ref?: string;
    po_date: string;
    delivery_date?: string;
    TC_E_PR_No?: string;
    approved_on?: string;
    approved_by?: string;
    created_by?: string;
    updated_by?: string;
    status?: string;
    customer_po: string;
    po_items: {
        item_code?: string;
        description: string;
        quantity: string;
        uom: string;
        price: string;
    }[];
}