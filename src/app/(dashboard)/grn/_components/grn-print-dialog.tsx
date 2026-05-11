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
import { format, parseISO } from "date-fns";
import { GRN } from "@/modules/grn/types";

interface GRNPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: GRN;
  onDecline?: () => void;
}

export function handleGRNPrint(data: GRN) {
  const printContent = buildGRNPrintHTML(data);
  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (!printWindow) return;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

export function GRNPrintDialog({
  open,
  onOpenChange,
  data,
  onDecline,
}: GRNPrintDialogProps) {
  const handlePrint = () => {
    handleGRNPrint(data);
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
            Print Goods Received Note?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          GRN record is ready. Would you like to print/download the Goods Received Note now?
        </p>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleDecline}>
            No, skip
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-white">
            <Printer className="h-4 w-4 mr-2" />
            Print GRN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function buildGRNPrintHTML(data: GRN): string {
  const safe = (val: string | number | null | undefined) => (val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "");

  let formattedDate = "";
  try {
    formattedDate = data.received_date ? format(parseISO(data.received_date), "dd/MM/yyyy") : "";
  } catch (_e) {
    formattedDate = safe(data.received_date);
  }

  // Calculate total amount
  const totalAmount = data.items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
  const rs = Math.floor(totalAmount);
  const cts = Math.round((totalAmount - rs) * 100);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>GRN - ${data.id}</title>
  <style>
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      color: #000;
      margin: 0;
      padding: 20px;
    }
    .print-container {
      width: 100%;
      position: relative;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
    }
    .company-info {
      text-align: left;
      vertical-align: top;
      width: 60%;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #000;
      margin-bottom: 2px;
    }
    .company-tagline {
      font-size: 10px;
      font-style: italic;
      margin-bottom: 10px;
    }
    .address-details {
      font-size: 10px;
      line-height: 1.4;
    }
    .grn-logo-box {
      text-align: right;
      vertical-align: top;
    }
    .company-logo {
      height: 70px;
    }
    
    .title-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .grn-title {
      font-size: 20px;
      font-weight: bold;
      text-decoration: underline;
    }
    .grn-no-box {
      border: 1px solid #000;
      padding: 10px;
      min-width: 200px;
    }
    .grn-no-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
    }
    .grn-no-val {
      font-weight: bold;
      font-size: 18px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 40px;
      margin-bottom: 20px;
    }
    .meta-item {
      display: flex;
      align-items: flex-end;
    }
    .meta-label {
      font-weight: bold;
      width: 100px;
      white-space: nowrap;
    }
    .meta-value {
      flex: 1;
      border-bottom: 1px dotted #000;
      padding-left: 5px;
      min-height: 18px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th, .items-table td {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
    }
    .items-table th {
      background: #f2f2f2;
      font-weight: bold;
    }
    .items-table .text-left {
      text-align: left;
    }
    .items-table .text-right {
      text-align: right;
    }
    
    .total-row td {
        font-weight: bold;
        background: #fafafa;
    }
    
    .acknowledgement {
        margin: 20px 0;
        font-style: italic;
        font-weight: 500;
    }

    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 30px;
      margin-top: 40px;
    }
    .sig-box {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .sig-line {
      display: flex;
      align-items: flex-end;
    }
    .sig-label {
      font-weight: 500;
      white-space: nowrap;
      margin-right: 5px;
    }
    .sig-dots {
      flex: 1;
      border-bottom: 1px dotted #000;
      min-height: 1px;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <table class="header-table">
      <tr>
        <td class="company-info">
          <img src="/images/madhawee_logo.svg" class="company-logo" style="height: 80px; margin-bottom: 10px;" />
          <div class="address-details">
            <b>Office & Factory :</b><br/>
            No. 624, Kandy Rd, Bulugaha Junction, Kelaniya. Tel : 2905229, 2905263/4<br/>
            E Mail - Madhaweeprinters@gmail.com
          </div>
        </td>
        <td class="grn-logo-box text-right">
          <!-- Right side reserved for GRN Number box -->
        </td>
      </tr>
    </table>

    <div class="title-bar">
      <div class="grn-title">GOODS RECEIVED NOTE</div>
      <div class="grn-no-box">
        <div class="grn-no-line">
          <span>Date :</span>
          <span style="font-weight: bold;">${safe(formattedDate)}</span>
        </div>
        <div class="grn-no-line" style="margin-top: 10px;">
          <span>G.R.N. NO.</span>
          <span class="grn-no-val">${safe(data.id)}</span>
        </div>
      </div>
    </div>

    <div class="metadata-grid">
      <div class="meta-item">
        <div class="meta-label">Customer :</div>
        <div class="meta-value">${safe(data.supplier_name)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Inv. No. :</div>
        <div class="meta-value">${safe(data.supplier_invoice_no)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">PO. No. :</div>
        <div class="meta-value">${safe(data.releated_po)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Advice No :</div>
        <div class="meta-value"></div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 10%;">Code</th>
          <th style="width: 10%;">Unit</th>
          <th style="width: 40%;">Description</th>
          <th style="width: 10%;">Qty</th>
          <th style="width: 15%;">Rate</th>
          <th colspan="2" style="width: 15%;">Value (Rs. / Cts.)</th>
        </tr>
      </thead>
      <tbody>
        ${(data.items || []).map((item, idx) => {
    const itemRs = Math.floor(Number(item.amount || 0));
    const itemCts = Math.round((Number(item.amount || 0) - itemRs) * 100);
    return `
          <tr>
            <td>${idx + 1}</td>
            <td>Nos.</td>
            <td class="text-left">${safe(item.item_name)}</td>
            <td>${safe(item.quantity)}</td>
            <td class="text-right">${Number(item.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td style="border-right: none; width: 10%;" class="text-right">${itemRs.toLocaleString()}</td>
            <td style="width: 5%;">${itemCts.toString().padStart(2, '0')}</td>
          </tr>
        `}).join("")}
        <!-- Fill remaining space if few items -->
        ${Array.from({ length: Math.max(0, 3 - (data.items?.length || 0)) }).map(() => `
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td style="border-right: none;">&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        `).join("")}
        <tr class="total-row">
            <td colspan="5" class="text-right">Total</td>
            <td style="border-right: none;" class="text-right">${rs.toLocaleString()}</td>
            <td>${cts.toString().padStart(2, '0')}</td>
        </tr>
      </tbody>
    </table>

    <div class="acknowledgement">
      I acknowledge the receipt of the above goods in good order.
    </div>

    <div class="signature-section">
      <div class="sig-box">
      
        <div class="sig-line">
          <div class="sig-label">Created By :</div>
          <div class="sig-dots" style="border:none; border-bottom:1px dotted #000; font-weight:bold; padding-left: 5px;">${safe(data.created_by)}</div>
          
        </div>
        <div class="sig-line">
         <div class="sig-label">Vehicle No :</div>
          <div class="sig-dots"></div>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-line">
          <div class="sig-label">Recived By (Name) :</div>
          <div class="sig-dots"></div>
        </div>
        <div class="sig-line">
          <div class="sig-label">Signature :</div>
          <div class="sig-dots"></div>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-line">
          <div class="sig-label">Checked By (Name) :</div>
          <div class="sig-dots"></div>
        </div>
        <div class="sig-line">
          <div class="sig-label">Signature :</div>
          <div class="sig-dots"></div>
        </div>
         
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
