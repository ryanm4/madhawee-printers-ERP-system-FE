export interface ALL_TICKETS {
    job_id: number;
    po_id: number;
    customer_id: string;
    job_name: string;
    job_open_date: Date;
    product_type: string;
    paper_type_id: number;
    quantity: number;
    coating: string;
    packing_date: Date;
    expiry_date: Date;
    description: string;
    artwork: string;
    remarks: string;
    status: string;
    completed_qty: number;
    wastage: string;
}

export interface CREATE_TICKETS {
    po_id: number;
}