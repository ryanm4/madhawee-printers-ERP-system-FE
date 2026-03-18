"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

export interface JobTicketPrintData {
  jobNumber?: string;
  productType?: string;
  orderReceivedDate?: Date | string;
  quantity?: string | number;
  jobOpenDate?: Date | string;
  paperType?: string;
  customer?: string;
  coating?: string;
  jobName?: string;
  customerDeliveryDate?: Date | string;
  packingDate?: Date | string;
  expiryDate?: Date | string;
  poNo?: string;
  tcNo?: string;
  batchRef?: string;
  remarks?: string;
  oldPlatesQuantity?: string;
  newPlatesQuantity?: string;
  inks?: { ink: string; quantity?: string; status?: string; remarks?: string }[];
  rawMaterials?: {
    material_name?: string;
    size?: string;
    quantity?: number | string;
    status?: string;
    remarks?: string;
  }[];
}

interface JobTicketPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: JobTicketPrintData;
  onDecline?: () => void;
}

function formatDate(date?: Date | string): string {
  if (!date) return "";
  try {
    return format(new Date(date), "dd/MM/yyyy");
  } catch {
    return String(date);
  }
}

function formatMonthYear(date?: Date | string): string {
  if (!date) return "";
  try {
    return format(new Date(date), "MMM yyyy");
  } catch {
    return String(date);
  }
}

export function JobTicketPrintDialog({
  open,
  onOpenChange,
  data,
  onDecline,
}: JobTicketPrintDialogProps) {
  const handlePrint = () => {
    // Build the printable HTML that matches the reference layout
    const printContent = buildPrintHTML(data);
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Give fonts/images time to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);

    onOpenChange(false);
  };

  const handleDecline = () => {
    onDecline?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Job Ticket?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Job ticket has been saved successfully. Would you like to print a copy
          now?
        </p>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleDecline}>
            No, skip
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-white">
            <Printer className="h-4 w-4 mr-2" />
            Yes, Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildPrintHTML(data: JobTicketPrintData): string {
  const td = (content: string, style = "") =>
    `<td style="border:1px solid #333;padding:5px 8px;${style}">${content}</td>`;
  const tdLabel = (content: string, style = "") =>
    `<td style="border:1px solid #333;padding:5px 8px;font-weight:bold;background:#f8f8f8;${style}">${content}</td>`;

  // Ink rows
  const inkRows = (data.inks || [])
    .map(
      (ink) => `
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">${ink.ink || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${ink.quantity || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${ink.status || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${ink.remarks || ""}</td>
    </tr>`
    )
    .join("");

  // Raw material rows
  const rmRows = (data.rawMaterials || [])
    .map(
      (rm) => `
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">${rm.material_name || ""} ${rm.size ? "- " + rm.size : ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${rm.quantity || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${rm.status || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${rm.remarks || ""}</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Job Ticket - ${data.jobNumber || ""}</title>
  <style>
    @media print {
      @page { margin: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .header-table td {
      border: 2px solid #333;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      padding: 8px;
    }
    .section-header td {
      border: 1px solid #333;
      text-align: center;
      font-weight: bold;
      background: #f0f0f0;
      padding: 5px;
    }
    .approval-label {
      font-weight: bold;
      padding: 5px 8px;
      border: 1px solid #333;
    }
    .approval-blank {
      border: 1px solid #333;
      padding: 5px 8px;
    }
    .materials-header td {
      border: 1px solid #333;
      font-weight: bold;
      padding: 5px 8px;
      background: #f0f0f0;
    }
    .group-label td {
      border: 1px solid #333;
      font-weight: bold;
      padding: 5px 8px;
      vertical-align: middle;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- Company Header -->
  <table class="header-table">
    <tr>
      <td>Madhawee Printers (PVT) Ltd</td>
    </tr>
  </table>

  <!-- Main Info Grid -->
  <table>
    <tr>
      ${tdLabel("Job Number:")}
      ${td(data.jobNumber || "", "text-align:center;")}
      ${tdLabel("Product Type")}
      ${td(data.productType || "", "text-align:center;")}
    </tr>
    <tr>
      ${tdLabel("Order Received Date")}
      ${td(formatDate(data.orderReceivedDate), "text-align:center;")}
      ${tdLabel("Quantity:")}
      ${td(String(data.quantity || ""), "text-align:center;")}
    </tr>
    <tr>
      ${tdLabel("Job Open Date")}
      ${td(formatDate(data.jobOpenDate), "text-align:center;")}
      ${tdLabel("Paper Type:")}
      ${td(data.paperType || "", "text-align:center;")}
    </tr>
    <tr>
      ${tdLabel("Customer:")}
      ${td(data.customer || "", "text-align:center;")}
      ${tdLabel("Coating")}
      ${td(data.coating || "", "text-align:center;")}
    </tr>
    <tr>
      ${tdLabel("Job Name:")}
      ${td(data.jobName || "", "background:#e8e8e8;")}
      ${tdLabel("Customer Del Date")}
      ${td(formatDate(data.customerDeliveryDate), "text-align:center;")}
    </tr>
  </table>

  <!-- Packing / Expiry -->
  <table>
    <tr>
      ${tdLabel("Packing Date")}
      ${td(formatMonthYear(data.packingDate), "text-align:center;")}
      ${tdLabel("Expiry Date")}
      ${td(formatMonthYear(data.expiryDate), "text-align:center;")}
    </tr>
  </table>

  <!-- PO / TC / Batch -->
  <table>
    <tr>
      ${tdLabel("PO No.")}
      ${td(data.poNo || "", "text-align:center;")}
      ${tdLabel("TC/E/PR/No.")}
      ${td(data.tcNo || "", "text-align:center;")}
      ${tdLabel("Batch Ref.")}
      ${td(data.batchRef || "", "text-align:center;")}
    </tr>
  </table>

  <!-- Remarks -->
  <table>
    <tr>
      ${tdLabel("Remarks")}
      ${td(data.remarks || "", "background:#e8e8e8;width:75%;")}
    </tr>
  </table>

  <!-- Approvals -->
  <table>
    <tr class="section-header">
      <td colspan="4">Approvals</td>
    </tr>
    <tr>
      <td class="approval-label">Art Work</td>
      <td class="approval-blank" style="width:30%;"></td>
      <td class="approval-label">Approved date:</td>
      <td class="approval-blank" style="width:20%;"></td>
    </tr>
    <tr>
      <td class="approval-label">Proof Print</td>
      <td class="approval-blank"></td>
      <td class="approval-label">Approved date:</td>
      <td class="approval-blank"></td>
    </tr>
  </table>

  <!-- Materials Table -->
  <table>
    <tr class="materials-header">
      <td style="width:35%;">Materials</td>
      <td style="width:22%;">Quantity</td>
      <td style="width:18%;">Status</td>
      <td style="width:25%;">Remarks</td>
    </tr>

    <!-- CTP Plates -->
    <tr>
      <td rowspan="2" class="group-label" style="border:1px solid #333;">CTP Plates</td>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">Old Plates${data.oldPlatesQuantity ? " (" + data.oldPlatesQuantity + ")" : ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">New Plates${data.newPlatesQuantity ? " (" + data.newPlatesQuantity + ")" : ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
    </tr>

    <!-- Raw Materials -->
    ${
      (data.rawMaterials || []).length > 0
        ? `<tr>
      <td rowspan="${data.rawMaterials!.length}" class="group-label" style="border:1px solid #333;">Raw Material</td>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">${data.rawMaterials![0].material_name || ""} ${data.rawMaterials![0].size ? "- " + data.rawMaterials![0].size : ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${data.rawMaterials![0].quantity || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${data.rawMaterials![0].remarks || ""}</td>
    </tr>${(data.rawMaterials || [])
      .slice(1)
      .map(
        (rm) => `
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">${rm.material_name || ""} ${rm.size ? "- " + rm.size : ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${rm.quantity || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${rm.remarks || ""}</td>
    </tr>`
      )
      .join("")}`
        : `<tr>
      <td class="group-label" style="border:1px solid #333;">Raw Material</td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
    </tr>`
    }

    <!-- Ink -->
    ${
      (data.inks || []).length > 0
        ? `<tr>
      <td rowspan="${data.inks!.length}" class="group-label" style="border:1px solid #333;">Ink</td>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">${data.inks![0].ink || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${data.inks![0].quantity || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${data.inks![0].remarks || ""}</td>
    </tr>${(data.inks || [])
      .slice(1)
      .map(
        (ink) => `
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;padding-left:24px;">${ink.ink || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${ink.quantity || ""}</td>
      <td style="border:1px solid #333;padding:5px 8px;">${ink.remarks || ""}</td>
    </tr>`
      )
      .join("")}`
        : `<tr>
      <td class="group-label" style="border:1px solid #333;">Ink</td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
      <td style="border:1px solid #333;padding:5px 8px;"></td>
    </tr>`
    }

    <!-- Extra blank rows -->
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;height:24px;"></td>
      <td style="border:1px solid #333;"></td>
      <td style="border:1px solid #333;"></td>
      <td style="border:1px solid #333;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #333;padding:5px 8px;height:24px;"></td>
      <td style="border:1px solid #333;"></td>
      <td style="border:1px solid #333;"></td>
      <td style="border:1px solid #333;"></td>
    </tr>
  </table>

</body>
</html>`;
}
