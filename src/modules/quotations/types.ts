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
    tax_type_id: number;
    currency: string;
    contact_person: string;
    notes: string;
    status: string;
    created_on: string;               // ISO string from API
    created_by: string;
    updated_on: string | null;
    updated_by: string;
}



export interface Material {
    item_id: number;
    material_type: string;
    material_name: string;
    material_description?: string;
    quantity: number;
    status: string;
    remarks?: string;
}


export interface CREATE_QUOTATION_REQUEST {
    customer_id: number;
    job_name: string;
    job_open_date: string; // ISO date string
    product_type: string;
    paper_type_id: string;
    quantity: number;
    coating?: string;
    packing_date?: string;
    expiry_date?: string;
    description?: string;
    artwork?: string;
    remarks?: string;
    status: string;
    completed_qty?: number;
    wastage?: string;
    materials?: Material[];
}


export interface DELETE_QUOTATION_REQUEST {
    quote_id: number;
}

export interface UPDATE_QUOTATION_REQUEST {
    quote_id: number;
    customer_id?: number;
    job_name?: string;
    job_open_date?: string;
    product_type?: string;
    paper_type_id?: string;
    quantity?: number;
    coating?: string;
    packing_date?: string;
    expiry_date?: string;
    description?: string;
    artwork?: string;
    remarks?: string;
    status?: string;
    completed_qty?: number;
    wastage?: string;
    materials?: Material[];
}
