export interface CREATE_REPORT {
    reportType: string;
    filters: {
        fromDate: Date,
        toDate: Date,
        customer_id?: number,
        status?: string,
        product_type?: string,
    }
}