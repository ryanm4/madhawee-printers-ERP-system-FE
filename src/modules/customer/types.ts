export interface CONTACT_PERSON {
    id?: number;
    name: string;
    email: string;
    phone: string;
}

export interface CUSTOMER {
    customer_id: number;
    customer_type: string;
    company_name: string;
    address: string,
    phone: string,
    email: string,
    credit_period: string,
    vat_type: string,
    vat_no: string,
    logo_url: string,
    contact_persons: string,
    created_on: string,
    created_by: string,
    updated_on: string,
    updated_by: string,
    status: string
}

export interface CREATE_CUSTOMER {
    customer_type: string;
    company_name: string;
    address: string,
    phone: string,
    email: string,
    credit_period: string,
    vat_type: string,
    vat_no: string,
    logo_url: string,
    contact_persons: string,
    created_by: string,
    updated_by: string,
    status: string,
}