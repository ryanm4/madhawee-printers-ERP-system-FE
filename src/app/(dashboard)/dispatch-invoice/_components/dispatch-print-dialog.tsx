"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";

export interface DispatchPrintData {
  dispatch_id: string | number;
  dispatch_date: Date | string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  delivery_address: string;
  dispatch_qty: string | number;
  no_of_bundles: string | number;
  description: string;
  job_id: string | number;
  job_name: string;
  job_number: string;
  po_id?: string | number;
  contact_person?: string;
  remarks?: string;
  created_by?: string;
}

interface DispatchPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DispatchPrintData;
  onDecline?: () => void;
}

export function handleDispatchPrint(data: DispatchPrintData) {
  const printContent = buildDispatchPrintHTML(data);
  const printWindow = window.open("", "_blank", "width=1000,height=700");
  if (!printWindow) return;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

export function DispatchPrintDialog({
  open,
  onOpenChange,
  data,
  onDecline,
}: DispatchPrintDialogProps) {
  const handlePrint = () => {
    handleDispatchPrint(data);
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
            Print Delivery Note?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Dispatch record has been saved successfully. Would you like to print/download the Delivery Note now?
        </p>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleDecline}>
            No, skip
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-white">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function buildDispatchPrintHTML(data: DispatchPrintData): string {
  const safe = (val: string | number | null | undefined) => (val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "&nbsp;");
  const formattedDate = data.dispatch_date ? format(new Date(data.dispatch_date), "dd/MM/yyyy") : "";
  const formattedTime = data.dispatch_date ? format(new Date(data.dispatch_date), "hh:mm a") : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Delivery Note - ${data.dispatch_id}</title>
  <style>
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .container {
      width: calc(100% - 30px);
      margin: 15px;
      border: 1px solid #333;
      padding: 20px;
      box-sizing: border-box;
      position: relative;
    }
    .header {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
      align-items: flex-start;
    }
    .company-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    .company-logo-text {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: -1px;
      display: flex;
      align-items: flex-start;
    }
    .company-logo-img {
      height: 60px;
      margin-left: -8px;
    }
    .company-details {
      font-size: 10px;
      line-height: 1.4;
      color: #444;
      margin-top: 5px;
    }
    
    .dn-label-container {
      width: 100%;
    }
    .customer-copy-text {
      text-align: right;
      font-size: 9px;
      color: #666;
      margin-bottom: 5px;
    }
    .dn-title-box {
      background: #444;
      color: #fff;
      padding: 6px;
      font-size: 13px;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .dn-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: -1px;
    }
    .dn-info-table td {
      border: 1px solid #333;
      padding: 6px 10px;
      height: 30px;
    }
    .label-cell {
      background: #f8f8f8;
      font-weight: bold;
      width: 30%;
    }
    
    .customer-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .customer-info-line {
      display: flex;
      margin-bottom: 8px;
    }
    .customer-info-line .lbl {
      width: 110px;
      font-weight: normal;
      color: #444;
    }
    .customer-info-line .val {
      flex: 1;
      border-bottom: 1px dotted #999;
      padding-bottom: 2px;
      min-height: 16px;
    }
    
    .main-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      table-layout: fixed;
    }
    .main-table th {
      border: 1px solid #333;
      padding: 10px;
      background: #f4f4f4;
      text-align: center;
      font-weight: bold;
      font-size: 12px;
    }
    .main-table td {
      border: 1px solid #333;
      padding: 8px;
      height: 20px;
    }
    
    .footer-note {
      text-align: right;
      font-size: 10px;
      color: #333;
      margin-bottom: 15px;
    }
    
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px 40px;
    }
    .sig-field {
      font-size: 10px;
      border-bottom: 1px dotted #666;
      padding-bottom: 4px;
      display: flex;
      margin-top: 5px;
    }
    .sig-label {
      white-space: nowrap;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-section">
        <img src="/images/madhawee_logo.svg?v=1" class="company-logo-img" />
        <div class="company-details">
          No. 624, Bulugaha Junction, Kandy Rd, Kelaniya. Tele: 2905263, 2905264, 2905229, 2907967<br/>
          Fax: 2905574 E-mail: madhaweeprinters@gmail.com
        </div>
      </div>
      <div class="dn-label-container">
        <div class="customer-copy-text">Customer Copy</div>
        <div class="dn-title-box">Delivery Note</div>
        <table class="dn-info-table">
          <tr>
            <td class="label-cell" style="width: 25%; font-size: 14px;">D.N No.</td>
            <td style="font-size: 22px; font-weight: bold; text-align: center;">${safe(data.dispatch_id)}</td>
            <td style="width: 100%; vertical-align: top; padding: 0;">
              <div style="display: flex; height: 90%;">
                <div style="flex: 1; border-right: 1px solid #333; padding: 4px 8px;">
                  <div style="font-size: 8px; color: #666;">Date & Time :</div>
                  <div style="font-weight: bold; text-align: center;">${safe(formattedDate)} ${safe(formattedTime)}</div>
                </div>
                <div style="flex: 1; padding: 4px 8px;">
                  <div style="font-size: 8px; color: #666;">Created By :</div>
                  <div style="font-weight: bold; text-align: center; font-size: 15px;">${safe(data.created_by)}</div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="customer-grid">
      <div>
        <div class="customer-info-line">
          <div class="lbl">Customer</div>
          <div class="val" style="font-weight: bold;">: ${safe(data.customer_name)}</div>
        </div>
        <div class="customer-info-line">
          <div class="lbl">Address & Tel</div>
          <div class="val">: ${safe(data.customer_address)}${data.customer_phone ? " / " + data.customer_phone : ""}</div>
        </div>
        <div class="customer-info-line" style="margin-top: 15px;">
          <div class="lbl">Delivery To</div>
          <div class="val">: ${safe(data.delivery_address || "Same as above")}</div>
        </div>
      </div>
      <div>
        <table class="dn-info-table">
          <tr><td class="label-cell">Issued From</td><td>: Madhawee Printers</td></tr>
          <tr><td class="label-cell">Ordered By</td><td>: ${safe(data.contact_person)}</td></tr>
          <tr><td class="label-cell">Ref No.</td><td>: ${safe(data.po_id)}</td></tr>
          <tr><td class="label-cell">Job No.</td><td>: ${safe(data.job_number)}</td></tr>
        </table>
      </div>
    </div>

    <table class="main-table">
      <thead>
        <tr>
          <th style="width: 15%;">Quantity</th>
          <th style="width: 15%;">No. of Bundles</th>
          <th style="width: 45%;">Description</th>
          <th style="width: 25%;">Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr style="height: 50px; vertical-align: top;">
          <td style="text-align: center; font-size: 16px; padding-top: 15px;">${safe(data.dispatch_qty)}</td>
          <td style="text-align: center; font-size: 16px;  padding-top: 15px;">${safe(data.no_of_bundles)}</td>
          <td style="padding-top: 15px; font-size: 12px; line-height: 1.5;">
            <div style="font-weight: bold;text-align: center; margin-bottom: 4px;">${safe(data.job_name)}</div>
          </td>
          <td style="padding-top: 15px; text-align: center;">${safe(data.description)}</td>
        </tr>
        <!-- Fewer dummy rows to keep on one page -->
        ${[1, 2, 3].map(() => `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join("")}
      </tbody>
    </table>

    <div class="footer-note">
      Received the above goods in good order & condition
    </div>

    <div class="signature-grid">
      <div class="sig-field"><span class="sig-label">Authorised by :</span></div>
      <div class="sig-field"><span class="sig-label">Received by (Name) :</span></div>
      <div class="sig-field"><span class="sig-label">Vehicle No :</span></div>
      <div class="sig-field"><span class="sig-label">Store Keeper :</span></div>
      <div class="sig-field"><span class="sig-label">Received by (Signature) :</span></div>
      <div class="sig-field"><span class="sig-label">ID No. :</span></div>
    </div>
  </div>
</body>
</html>
  `;
}
