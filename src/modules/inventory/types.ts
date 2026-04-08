export interface GET_ALL_INVENTORY {
    item_id: number;
    item_category: string;
    item_sub_category: string;
    item_name: string;
    size: string;
    quantity: string;
    unit_of_measure: string;
    reorder_level: string;
    status: string;
    remarks: string;
    created_on: string;
    created_by: string;
    updated_on: string;
    updated_by: string;

}

export interface CREATE_INVENTORY {
    item_category: string;
    item_sub_category: string;
    item_name: string;
    size: string;
    width: string;
    height: string;
    quantity: string;
    unit_of_measure: string;
    reorder_level: string;
    status: string;
    remarks: string;
    created_by?: string;
    updated_by?: string;
}

