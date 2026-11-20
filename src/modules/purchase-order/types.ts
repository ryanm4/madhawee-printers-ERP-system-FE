export interface PURCHASE_ORDER {
    po_id: number,
    quote_id: number,
    customer_po: string,
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
    currency: string,
    sales_ref?: string;
    customer: PO_CUSTOMER,
    po_items: PO_ITEMS[],
    jobs: PURCHASE_ORDER_JOBS[],
    [key: string]: unknown;
}

export interface PO_ITEMS {
    po_id: number,
    po_item_id?: number,
    item_code: string,
    description: string,
    quantity: number,
    uom: string,
    price: number,
    [key: string]: unknown;
}

export interface PO_CUSTOMER {
    name: string,
    email: string,
    phone: string,
    address: string;
    customer_id: number;
}

export interface CREATE_PURCHASE_ORDER {
    quote_id: number;
    customer_id: number;
    po_type_id: number;
    batch_ref?: string;
    po_date: string | Date; // Allow both for convenience
    delivery_date?: string | Date;
    TC_E_PR_No?: string;
    approved_on?: string | Date;
    approved_by?: string;
    created_by?: string;
    created_on?: Date;
    updated_on?: Date;
    updated_by?: string;
    status?: string;
    customer_po: string;
    sales_ref?: string;
    currency?: string;
    po_items: {
        item_code?: string;
        description: string;
        quantity: string;
        uom: number | string;
        price: string;
    }[];
}

export interface PURCHASE_ORDER_JOBS {
    job_id: number,
    job_number: string;
    job_name: string;
    status: string;
    job_open_date: string;
}

export interface PURCHASE_ORDER_ID extends PURCHASE_ORDER {
    po_status?: string; // Some API responses use po_status instead of status
}