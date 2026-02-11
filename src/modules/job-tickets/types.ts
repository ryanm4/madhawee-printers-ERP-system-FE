export interface ALL_TICKETS {
  job_id: number;
  po_id: number;
  customer_id: string;
  job_name: string;
  job_open_date: Date;
  product_type: string;
  paper_type_id: string;
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
  po_id?: number;
  item_code?: string;
  job_number?: string;
  order_received_date?: string | Date;
  job_open_date?: string | Date;
  customer_id?: number | string;
  job_name?: string;
  product_type?: string;
  quantity?: number | string;
  completed_qty?: number | string;
  wastage?: string;
  packing_date?: string | Date;
  expiry_date?: string | Date;
  tc_no?: string;
  batch_ref?: string;
  remarks?: string;

  // Plates
  old_plate_quantity?: string;
  old_plate_status?: string;
  old_plate_remarks?: string;
  new_plate_quantity?: string;
  new_plate_status?: string;
  new_plate_remarks?: string;

  // Arrays
  raw_materials?: {
    item?: string;
    quantity?: string;
    status?: string;
    remarks?: string;
  }[];
  inks?: {
    ink?: string;
    quantity?: string;
    status?: string;
    remarks?: string;
  }[];
  paperCoating?: {
    paper: string;
    coating: string;
    delivery_date?: Date | string;
  }[];

  status?: string;
  created_by?: string;
  created_on?: Date;

  updated_by?: string;
  updated_on?: Date;
}
