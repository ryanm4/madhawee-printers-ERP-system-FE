/** How much of the bank account a quotation prints: none, all of it, or all but the account number */
export type BankDetailsMode = "NONE" | "FULL" | "HIDE_NUMBER";

/** The bank account a quotation prints and how much of it; no account means the default one */
export interface QuotationBankChoice {
    bank_details: BankDetailsMode;
    bank_account_id: number | null;
}

export interface QUOTATIONS {
    quote_id: number;
    customer_id: number;
    company_name: string;
    customer_address: string;
    customer_type: string;
    customer_phone: string;
    customer_email: string;
    type_id: number;
    delivery_days: string;
    validity_period: string;
    tax_type_id: number;
    currency: string;
    contact_person: string;
    marketing_person: string;
    marketing_person_phone?: string | null;
    notes: string;
    status: string;
    sub_total: string;
    no_of_items: string;
    total_without_tax: string;
    net_total: string;
    created_on: string;               // ISO string from API
    created_by: string;
    updated_on: string | null;
    updated_by: string;
    items?: QuotationItems[];
    quote_date?: string;
    bank_details?: BankDetailsMode;
    bank_account_id?: number | null;
    [key: string]: unknown; // For ExportButton compatibility
}



export interface QuotationItems {
    item_id: number;
    item_category: string;
    item_qty: string;
    item_description?: string;
    item_unit_price: string;
    item_unit_discount: string;
    item_total_price: string;
}


export interface CREATE_QUOTATION_REQUEST {
    customer_id: number;
    type_id: number;
    delivery_days: string;
    validity_period: string;
    tax_type_id: number;
    currency: string;
    contact_person: string | null;
    marketing_person: string | null;
    notes: string;
    status: string;
    sub_total?: string;
    no_of_items: string;
    total_without_tax?: string;
    net_total: string;
    created_by: string;
    created_on: Date;
    bank_details?: BankDetailsMode;
    bank_account_id?: number | null;
    items: QuotationItems[];
}


export interface UPDATE_QUOTATION_REQUEST {
    quote_id: number;
    customer_id?: number;
    type_id?: number;
    delivery_days?: string;
    validity_period?: string;
    tax_type_id?: number;
    currency?: string;
    contact_person?: string | null;
    marketing_person?: string | null;
    notes?: string;
    status?: string;
    sub_total?: string;
    no_of_items?: string;
    total_without_tax?: string;
    net_total?: string;
    updated_on?: Date;
    updated_by?: string;
    /** Left out by status changes, so the saved bank choice stays as it is */
    bank_details?: BankDetailsMode;
    bank_account_id?: number | null;
    items?: QuotationItems[];
}


export interface DELETE_QUOTATION_REQUEST {
    quote_id: number;
}