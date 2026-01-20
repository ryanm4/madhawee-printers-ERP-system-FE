export interface ALL_DISPATCH {
    dispatch_id: string;
    dispatch_note: string;
    dispatch_qty: string;
    no_of_bundles: string;
    description: string;
    delivery_address: string;
    dispatch_date: Date;
    status: string;
    create_by: string;
    created_on: Date;
    updated_by: string
    updated_on: Date;
    customer_id: number;
    customer_name: string;
    customer_type: string;
    customer_address: string;
    customer_phone: string;
    customer_email: string;
    contact_person: string;
    contact_person_phone: string;
    contact_person_email: string;
    job_id: number;
    po_id: number;
    job_name: string;
    job_open_date: Date;
    product_type: string;
    paper_type_id: number;
    job_quantity: number;
    coating: string;
    packing_date: Date;
    expiry_date: Date;
    completed_by: string;
    wastage: string;
    job_status: string;

}

export interface CREATE_DISPATCH {
    customer_id: string;
    job_id: string | number;
    dispatch_note: string;
    dispatch_date: string;
    dispatch_qty: string;
    no_of_bundles: string;
    description: string;
    delivery_address: string;
    status: string;
    create_by: string;
    created_on: Date;
}