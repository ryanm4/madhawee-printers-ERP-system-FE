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
import { GRN } from "@/modules/grn/types";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";

interface GRNPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: GRN;
  inventoryData?: GET_ALL_INVENTORY[];
  onDecline?: () => void;
}

export function handleGRNPrint(data: GRN, inventoryData?: GET_ALL_INVENTORY[]) {
  const printContent = buildGRNPrintHTML(data, inventoryData);
  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (!printWindow) return;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();

  // Print will be triggered by image onload
}

export function GRNPrintDialog({
  open,
  onOpenChange,
  data,
  inventoryData,
  onDecline,
}: GRNPrintDialogProps) {
  const handlePrint = () => {
    handleGRNPrint(data, inventoryData);
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

export function buildGRNPrintHTML(data: GRN, inventoryData?: GET_ALL_INVENTORY[]): string {
  const safe = (val: string | number | null | undefined) => (val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "");

  let formattedDate = "";
  try {
    formattedDate = data.received_date ? format(parseLocalDate(data.received_date), "dd/MM/yyyy") : "";
  } catch (_e) {
    formattedDate = safe(data.received_date);
  }

  // Calculate total amount
  const totalAmount = data.items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
  const rs = Math.floor(totalAmount);
  const cts = Math.round((totalAmount - rs) * 100);

  const renderCopy = (copyType: string) => {
    return `
      <div class="print-container">
        <table class="header-table">
          <tr>
            <td class="company-info">
              <img src="/images/madhawee_logo.svg" onload="if('${copyType}' === 'Client Copy') { window.print(); window.close(); }" onerror="if('${copyType}' === 'Client Copy') { window.print(); window.close(); }" class="company-logo" style="height: 60px; margin-bottom: 5px;" />
              <div class="address-details">
                <b>Office & Factory :</b><br/>
                No. 624, Kandy Rd, Bulugaha Junction, Kelaniya. Tel : 2905229<br/>
                E Mail - Madhaweeprinters@gmail.com
              </div>
            </td>
            <td class="grn-logo-box text-right">
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
            <div class="grn-no-line" style="margin-top: 5px;">
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
            <div class="meta-value">${safe(data.related_po)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Advice No :</div>
            <div class="meta-value"></div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 5%;">Code</th>
              <th style="width: 10%;">Unit</th>
              <th style="width: 45%;">Description</th>
              <th style="width: 10%;">Qty</th>
              <th style="width: 10%;">Rate</th>
              <th colspan="2" style="width: 20%;">Value (Rs. / Cts.)</th>
            </tr>
          </thead>
          <tbody>
            ${(data.items || []).map((item, idx) => {
      const itemRs = Math.floor(Number(item.amount || 0));
      const itemCts = Math.round((Number(item.amount || 0) - itemRs) * 100);
      const invItem = inventoryData?.find(
        (inv) =>
          inv.item_name === item.item_name ||
          `${inv.item_sub_category} ${inv.item_name}` === item.item_name ||
          `${inv.item_sub_category} ${inv.item_name} (${inv.size || ""})` === item.item_name ||
          `${inv.item_sub_category} ${inv.item_name} ${inv.size || ""}`.trim() === item.item_name ||
          `${inv.item_name} ${inv.size || ""}`.trim() === item.item_name ||
          `${inv.item_name} (${inv.size || ""})` === item.item_name
      );
      const size = invItem?.size || "";
      const unit = invItem?.unit_of_measure || "Nos.";
      const displayDescription = size ? `${safe(item.item_name)} (${safe(size)})` : safe(item.item_name);
      return `
              <tr>
                <td>${idx + 1}</td>
                <td>${safe(unit)}</td>
                <td class="text-left">${safe(displayDescription)}</td>
                <td>${safe(item.quantity)}</td>
                <td class="text-right">${Number(item.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style="border-right: none; width: 15%;" class="text-right">${itemRs.toLocaleString()}</td>
                <td style="width: 5%;">${itemCts.toString().padStart(2, '0')}</td>
              </tr>
            `}).join("")}
            <!-- Fill remaining space if few items -->
            ${Array.from({ length: Math.max(0, 2 - (data.items?.length || 0)) }).map(() => `
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
              <div class="sig-label">Recived By :</div>
              <div class="sig-dots"></div>
            </div>
            <div class="sig-line">
              <div class="sig-label">Signature :</div>
              <div class="sig-dots"></div>
            </div>
          </div>
          <div class="sig-box">
            <div class="sig-line">
              <div class="sig-label">Checked By :</div>
              <div class="sig-dots"></div>
            </div>
            <div class="sig-line">
              <div class="sig-label">Signature :</div>
              <div class="sig-dots"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>GRN - ${data.id}</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-divider { display: block !important; border-top: 1px dashed #999; margin: 5mm 0; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .print-wrapper {
      padding: 10px 20px;
      max-width: 210mm;
      margin: 0 auto;
    }
    .print-container {
      width: 100%;
      position: relative;
      height: 125mm; /* Reduced to fit two perfectly within A4 */
      display: flex;
      flex-direction: column;
    }
    .page-divider {
      display: block;
      border-top: 1px dashed #ccc;
      margin: 10px 0;
      width: 100%;
    }
    .copy-badge {
      position: absolute;
      top: 0;
      right: 0;
      font-weight: bold;
      border: 1px solid #000;
      padding: 2px 6px;
      font-size: 10px;
      background: #f8f9fa;
      border-radius: 4px;
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
    .address-details {
      font-size: 9px;
      line-height: 1.3;
    }
    .grn-logo-box {
      text-align: right;
      vertical-align: top;
    }
    
    .title-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .grn-title {
      font-size: 16px;
      font-weight: bold;
      text-decoration: underline;
    }
    .grn-no-box {
      border: 1px solid #000;
      padding: 5px 10px;
      min-width: 150px;
    }
    .grn-no-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 11px;
    }
    .grn-no-val {
      font-weight: bold;
      font-size: 14px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 30px;
      margin-bottom: 10px;
    }
    .meta-item {
      display: flex;
      align-items: flex-end;
    }
    .meta-label {
      font-weight: bold;
      width: 80px;
      white-space: nowrap;
    }
    .meta-value {
      flex: 1;
      border-bottom: 1px dotted #000;
      padding-left: 5px;
      min-height: 14px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      flex: 1;
    }
    .items-table th, .items-table td {
      border: 1px solid #000;
      padding: 4px 6px;
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
        margin: 5px 0 10px 0;
        font-style: italic;
        font-weight: 500;
        font-size: 10px;
    }

    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 10px;
      margin-bottom: 5px;
    }
    .sig-box {
      display: flex;
      flex-direction: column;
      gap: 10px;
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
      min-height: 12px;
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    ${renderCopy('Office Copy')}
    <div class="page-divider"></div>
    ${renderCopy('Client Copy')}
  </div>
</body>
</html>
  `;
}
