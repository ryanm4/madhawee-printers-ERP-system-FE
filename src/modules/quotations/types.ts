export interface QUOTATIONS {
    quote_id: string;
    customer_id: number;
    type_id: number;
    delivery_days: string;
    tax_type_id: number;
    currency: string;
    sub_total: string;
    no_of_items: string;
    total_without_tax: string;
    net_total: string;
    contact_person: string;
    notes: string;
    created_on: Date;
    created_by: string;
    updated_on: Date;
    updated_by: string;
    status: string;
}