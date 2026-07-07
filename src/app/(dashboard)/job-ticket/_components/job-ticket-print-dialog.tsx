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
import { parseLocalDate } from "@/hooks/sql-date-time";

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
  inks?: {
    ink: string;
    quantity?: string;
    status?: string;
    remarks?: string;
  }[];
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
    return format(parseLocalDate(date), "dd/MM/yyyy");
  } catch {
    return String(date);
  }
}

function formatMonthYear(date?: Date | string): string {
  if (!date) return "";
  try {
    return format(parseLocalDate(date), "MMM yyyy");
  } catch {
    return String(date);
  }
}

function formatNumber(value?: string | number): string {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString();
}

export function handleJobTicketPrint(data: JobTicketPrintData) {
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
}

export function JobTicketPrintDialog({
  open,
  onOpenChange,
  data,
  onDecline,
}: JobTicketPrintDialogProps) {
  const handlePrint = () => {
    handleJobTicketPrint(data);
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

export function buildPrintHTML(data: JobTicketPrintData): string {
  const safe = (val: unknown) => (val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "&nbsp;");
  const td = (content: string, style = "") =>
    `<td style="border:1px solid #333;padding:5px 8px;${style}">${safe(content)}</td>`;
  const tdLabel = (content: string, style = "") =>
    `<td style="border:1px solid #333;padding:5px 8px;font-weight:bold;background:#f8f8f8;${style}">${safe(content)}</td>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <base href="${window.location.origin}" />
  <title>Job Ticket - ${data.jobNumber || ""}</title>
  <style>
    @media print {
      @page { margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 0px;
    }
    td {
      border: 1px solid #333;
      padding: 5px 8px;
    }
    .label {
      font-weight: bold;
      background: #f8f8f8;
      vertical-align: middle;
    }
    .value {
      text-align: center;
      vertical-align: middle;
      word-wrap: break-word;
    }
    .value-bold {
      font-weight: bold;
      font-size: 14px;
    }
    .value-highlight {
      background: #e8e8e8;
      font-weight: bold;
      font-size: 14px;
    }
    .materials-header td {
      font-weight: bold;
      background: #f0f0f0;
      text-align: center;
    }
    .group-label {
      font-weight: bold;
      vertical-align: middle;
      text-align: center;
      background: #f8f8f8;
    }
    .center { text-align: center; }
  </style>
</head>
<body>

  <!-- Unified Master Table for Alignment -->
  <table>
    <!-- Define column widths for 12-column grid to allow mixing 2, 3, 4, 6 column layouts -->
    <colgroup>
      <col style="width: 8.33%"><col style="width: 8.33%"><col style="width: 8.33%"><col style="width: 8.33%">
      <col style="width: 8.33%"><col style="width: 8.33%"><col style="width: 8.33%"><col style="width: 8.33%">
      <col style="width: 8.33%"><col style="width: 8.33%"><col style="width: 8.33%"><col style="width: 8.33%">
    </colgroup>

    <!-- Company Header -->
    <tr>
      <td colspan="12" style="border: 2px solid #333; text-align: center; padding: 10px;">
        <img src="/images/madhawee_logo.svg" style="height: 50px; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto;" />
      </td>
    </tr>

    <!-- Spacer -->
    <tr style="height: 10px; border: none;"><td colspan="12" style="border: none;"></td></tr>

    <!-- Row 1: Job Number & Product Type -->
    <tr>
      <td colspan="2" class="label">Job Number:</td>
      <td colspan="4" class="value">${safe(data.jobNumber)}</td>
      <td colspan="2" class="label">Product Type</td>
      <td colspan="4" class="value">${safe(data.productType)}</td>
    </tr>

    <!-- Row 2: Order Date & Quantity -->
    <tr>
      <td colspan="2" class="label">Order Rec Date</td>
      <td colspan="4" class="value">${safe(formatDate(data.orderReceivedDate))}</td>
      <td colspan="2" class="label">Quantity:</td>
      <td colspan="4" class="value value-bold" style="font-size: 20px;">${safe(formatNumber(data.quantity))}</td>
    </tr>

    <!-- Row 3: Open Date & Paper Type -->
    <tr>
      <td colspan="2" class="label">Job Open Date</td>
      <td colspan="4" class="value">${safe(formatDate(data.jobOpenDate))}</td>
      <td colspan="2" class="label">Paper Type:</td>
      <td colspan="4" class="value">${safe(data.paperType)}</td>
    </tr>

    <!-- Row 4: Customer & Coating -->
    <tr>
      <td colspan="2" class="label">Customer:</td>
      <td colspan="4" class="value value-bold" style="font-size: 18px;">${safe(data.customer)}</td>
      <td colspan="2" class="label">Coating</td>
      <td colspan="4" class="value">${safe(data.coating)}</td>
    </tr>

    <!-- Row 5: Job Name & Customer Del Date -->
    <tr>
      <td colspan="2" class="label">Description:</td>
      <td colspan="4" class="value value-highlight" style="text-align:center;">${safe(data.jobName)}</td>
      <td colspan="2" class="label">Customer Del Date</td>
      <td colspan="4" class="value">${safe(formatDate(data.customerDeliveryDate))}</td>
    </tr>

    <!-- Spacer -->
    <tr style="height: 5px; border: none;"><td colspan="12" style="border: none;"></td></tr>

    <!-- Packing & Expiry -->
    <tr>
      <td colspan="2" class="label">Packing Date</td>
      <td colspan="4" class="value">${safe(formatMonthYear(data.packingDate))}</td>
      <td colspan="2" class="label">Expiry Date</td>
      <td colspan="4" class="value">${safe(formatMonthYear(data.expiryDate))}</td>
    </tr>

    <!-- Spacer -->
    <tr style="height: 5px; border: none;"><td colspan="12" style="border: none;"></td></tr>

    <!-- PO / TC / Batch (6 equal segments) -->
    <tr>
      <td colspan="2" class="label">PO No.</td>
      <td colspan="2" class="value">${safe(data.poNo)}</td>
      <td colspan="2" class="label">TC/E/PR/No.</td>
      <td colspan="2" class="value">${safe(data.tcNo)}</td>
      <td colspan="2" class="label">Batch Ref.</td>
      <td colspan="2" class="value">${safe(data.batchRef)}</td>
    </tr>

    <!-- Spacer -->
    <tr style="height: 5px; border: none;"><td colspan="12" style="border: none;"></td></tr>

    <!-- Remarks -->
    <tr>
      <td colspan="2" class="label" style="vertical-align: middle;">Remarks</td>
      <td colspan="10" class="value value-highlight" style="text-align: left; font-size: 14px;">${safe(data.remarks)}</td>
    </tr>

    <!-- Spacer -->
    <tr style="height: 10px; border: none;"><td colspan="12" style="border: none;"></td></tr>

    <!-- Materials Header -->
    <tr class="materials-header">
      <td colspan="2">Materials</td>
      <td colspan="4">Items</td>
      <td colspan="2">Quantity</td>
      <td colspan="4">Remarks</td>
    </tr>

    <!-- CTP Plates -->
    <tr>
      <td rowspan="2" colspan="2" class="group-label">CTP Plates</td>
      <td colspan="4" style="padding-left: 24px;">Old Plates</td>
      <td colspan="2" class="center">${safe(formatNumber(data.oldPlatesQuantity || 0))}</td>
      <td colspan="4">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="4" style="padding-left: 24px;">New Plates</td>
      <td colspan="2" class="center">${safe(formatNumber(data.newPlatesQuantity || 0))}</td>
      <td colspan="4">&nbsp;</td>
    </tr>

    <!-- Raw Materials -->
    ${(data.rawMaterials || []).length > 0
      ? `<tr>
      <td rowspan="${data.rawMaterials!.length}" colspan="2" class="group-label">Raw Material</td>
      <td colspan="4" style="padding-left: 24px;">${safe(data.rawMaterials![0].material_name)} ${data.rawMaterials![0].size ? "- " + data.rawMaterials![0].size : ""}</td>
      <td colspan="2" class="center">${safe(formatNumber(data.rawMaterials![0].quantity))}</td>
      <td colspan="4">${safe(data.rawMaterials![0].remarks)}</td>
    </tr>${(data.rawMaterials || [])
        .slice(1)
        .map(
          (rm) => `
    <tr>
      <td colspan="4" style="padding-left: 24px;">${safe(rm.material_name)} ${rm.size ? "- " + rm.size : ""}</td>
      <td colspan="2" class="center">${safe(formatNumber(rm.quantity))}</td>
      <td colspan="4">${safe(rm.remarks)}</td>
    </tr>`
        )
        .join("")}`
      : `<tr>
      <td colspan="2" class="group-label">Raw Material</td>
      <td colspan="4">&nbsp;</td>
      <td colspan="2" class="center">&nbsp;</td>
      <td colspan="4">&nbsp;</td>
    </tr>`
    }

    <!-- Ink -->
    ${(data.inks || []).length > 0
      ? `<tr>
      <td rowspan="${data.inks!.length}" colspan="2" class="group-label">Ink</td>
      <td colspan="4" style="padding-left: 24px;">${safe(data.inks![0].ink)}</td>
      <td colspan="2" class="center">${safe(formatNumber(data.inks![0].quantity))}</td>
      <td colspan="4">${safe(data.inks![0].remarks)}</td>
    </tr>${(data.inks || [])
        .slice(1)
        .map(
          (ink) => `
    <tr>
      <td colspan="4" style="padding-left: 24px;">${safe(ink.ink)}</td>
      <td colspan="2" class="center">${safe(formatNumber(ink.quantity))}</td>
      <td colspan="4">${safe(ink.remarks)}</td>
    </tr>`
        )
        .join("")}`
      : `<tr>
      <td colspan="2" class="group-label">Ink</td>
      <td colspan="4">&nbsp;</td>
      <td colspan="2" class="center">&nbsp;</td>
      <td colspan="4">&nbsp;</td>
    </tr>`
    }
  </table>

</body>
</html>`;
}
