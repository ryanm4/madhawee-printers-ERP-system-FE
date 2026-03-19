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
  delivery_date: Date;
  wastage: string;
}

export interface JOB_TICKET_DETAIL {
  job_id: number;
  po_id: number;
  customer_id: string;
  job_item: string;
  job_name: string;
  job_open_date: string | Date;
  product_type: string;
  paper_type_id: string | null;
  quantity: number;
  completed_qty: number | null;
  coating: string | null;
  packing_date: string | Date | null;
  expiry_date: string | Date | null;
  description: string;
  artwork: string;
  remarks: string;
  status: string;
  wastage: string;
  job_number: string;

  // Plates
  old_plate_quantity?: number;
  old_plate_status?: string;
  old_plate_remarks?: string;
  new_plate_quantity?: number;
  new_plate_status?: string;
  new_plate_remarks?: string;

  created_on?: string | Date;
  created_by?: string;
  updated_on?: string | Date | null;
  updated_by?: string | null;

  customer?: {
    customer_id: number;
    company_name: string;
    customer_type: string;
    address: string;
    phone: string;
    email: string;
    vat_type: string;
    vat_no: string;
    logo_url: string;
    contact_person: string;
    contact_person_email: string;
    contact_person_phone: string;
    status: string;
  };

  paperCoating?: {
    id: number;
    paper: string;
    coating: string;
    delivery_date: string | Date | null;
    materials: {
      item_id: number;
      material_type: string;
      material_name: string;
      size: string;
      material_description: string | null;
      quantity: number;
      status: string;
      remarks: string;
    }[];
  }[];

  inks?: {
    id: number;
    job_id: string;
    ink: string;
    quantity: string | null;
    status: string | null;
    remarks: string | null;
  }[];

  delivery_date: string | Date | null;
}

export interface CREATE_TICKETS {
  po_id?: number;
  job_item?: string;
  job_number?: string;
  order_received_date?: string | Date;
  job_open_date?: string | Date;
  customer_id?: number | string;
  job_name?: string;
  product_type?: string;
  quantity?: number | string;
  completed_qty?: number | string;
  delivery_date?: string | Date;
  wastage?: string;
  packing_date?: string | Date;
  expiry_date?: string | Date;
  tc_no?: string;
  batch_ref?: string;
  remarks?: string;
  artwork?: string;
  description?: string;

  // Plates
  old_plate_quantity?: number;
  old_plate_status?: string;
  old_plate_remarks?: string;
  new_plate_quantity?: number;
  new_plate_status?: string;
  new_plate_remarks?: string;

  // Arrays
  paperCoating?: {
    paper: string;
    coating: string;
    materials?: {
      item_id?: number;
      material_type?: string;
      material_name?: string;
      size?: string;
      material_description?: string;
      quantity?: number;
      status?: string;
      remarks?: string;
    }[];
  }[];
  inks?: {
    ink?: string;
    quantity?: string;
    status?: string;
    remarks?: string;
  }[];

  status?: string;
  created_by?: string;
  created_on?: Date;

  updated_by?: string;
  updated_on?: Date;
}
