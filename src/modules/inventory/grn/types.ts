export interface GRNItem {
    id?: number;
    item_name: string;
    quantity: number;
    rate: string | number;
    amount: string | number;
}

export interface GRN {
    id: number;
    releated_po: string;
    received_date: string;
    supplier_name: string;
    stock_location: string;
    payee_name: string;
    payment_method: string;
    currency: string;
    supplier_invoice_no: string;
    remarks: string;
    created_on: string | null;
    created_by: string | null;
    updated_on: string | null;
    updated_by: string | null;
    items: GRNItem[];
    [key: string]: unknown;
}
