export interface SUPPLIER_CONTACT {
    id?: number;
    name: string;
    email: string;
    phone: string;
}

export interface SUPPLIER {
    customer_id: number; // Keeping internal backend key naming for compatibility
    customer_type: string;
    company_name: string;
    address: string;
    phone: string;
    email: string;
    credit_period: string;
    vat_type: string;
    vat_no: string;
    logo_url: string;
    contact_persons: SUPPLIER_CONTACT[];
    created_on: string;
    created_by: string;
    updated_on: string;
    updated_by: string;
    status: string;
    [key: string]: unknown;
}

export interface CREATE_SUPPLIER {
    customer_type: string;
    company_name: string;
    address: string;
    phone: string;
    email: string;
    credit_period: string;
    vat_type: string;
    vat_no: string;
    logo_url: string;
    contact_persons: SUPPLIER_CONTACT[];
    created_by: string;
    status: string;
}

export interface UPDATE_SUPPLIER extends Partial<CREATE_SUPPLIER> {
    customer_id: number;
    updated_by: string;
}
