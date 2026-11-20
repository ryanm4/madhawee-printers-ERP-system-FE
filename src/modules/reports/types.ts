export interface CREATE_REPORT {
    reportType: string;
    filters: {
        fromDate: Date | string,
        toDate: Date | string,
        customer_id?: number,
        status?: string,
        product_type?: string,
    }
}
/** One job in the Job Delivery Summary: what was ordered against what has been dispatched */
export interface JobDeliveryRow {
    job_id: number;
    job_number: string | null;
    job_open_date: string | null;
    customer_id: string | null;
    customer_name: string;
    job_name: string | null;
    order_qty: number;
    delivery_qty: number;
    balance_qty: number;
}
