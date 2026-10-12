/* eslint-disable @typescript-eslint/no-explicit-any */
import { toMySQLDateTime } from "@/hooks/sql-date-time";
import { jobTicketsApi } from "./api";
import type { CREATE_TICKETS, JOB_TICKET_DETAIL } from "./types";

/** Save a new status on a job ticket, keeping everything else as it is */
export async function updateJobTicketStatus(currentTicket: JOB_TICKET_DETAIL, status: string) {
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return undefined;

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return undefined;
    }

    return toMySQLDateTime(parsed);
  };
  // Construct payload matching CREATE_TICKETS interface
  const payload = {
    po_id: currentTicket.po_id,
    item_code: currentTicket.item_code,
    job_number: currentTicket.job_number,
    order_received_date: formatDate(currentTicket.order_received_date),
    job_open_date: formatDate(currentTicket.job_open_date),
    customer_id: currentTicket.customer_id,
    job_name: currentTicket.job_name,
    product_type: currentTicket.product_type,
    quantity: currentTicket.quantity,
    completed_qty: currentTicket.completed_qty,
    wastage: currentTicket.wastage,
    packing_date: formatDate(currentTicket.packing_date),
    expiry_date: formatDate(currentTicket.expiry_date),
    tc_no: currentTicket.tc_no,
    batch_ref: currentTicket.batch_ref,
    remarks: currentTicket.remarks,

    // Plates
    old_plates_quantity: currentTicket.old_plates_quantity,
    old_plates_status: currentTicket.old_plates_status,
    old_plates_remarks: currentTicket.old_plates_remarks,
    new_plates_quantity: currentTicket.new_plates_quantity,
    new_plates_status: currentTicket.new_plates_status,
    new_plates_remarks: currentTicket.new_plates_remarks,

    // Map Arrays
    paperCoating: (
      (currentTicket.paperCoating ||
        (currentTicket as Record<string, unknown>).paper_coating ||
        []) as any[]
    ).map((p: Record<string, unknown>) => ({
      paper: p.paper || p.paper_type,
      coating: p.coating,
      delivery_date: formatDate(p.delivery_date as any),
      materials: p.materials || (p as any).raw_materials || [],
    })),

    inks: currentTicket.inks || [],
    status: status,
    created_by:
      ((currentTicket as Record<string, unknown>)
        .created_by as string) || "User",
  };

  await jobTicketsApi.update(currentTicket.job_id, payload as CREATE_TICKETS);
}
