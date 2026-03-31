import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { GRN } from "./types";

export const generateGRNPdf = (grn: GRN) => {
    function numberToWords(num: number): string {
        if (num === 0) return "Zero";
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const numStr = Math.floor(num).toString();
        if (numStr.length > 9) return "Overflow"; 
        const paddedNum = ("000000000" + numStr).slice(-9);
        
        const millions = parseInt(paddedNum.slice(0, 3));
        const thousands = parseInt(paddedNum.slice(3, 6));
        const units = parseInt(paddedNum.slice(6, 9));
        
        let str = "";
        
        const convertHundreds = (n: number) => {
            let res = "";
            if (n > 99) {
                res += a[Math.floor(n / 100)] + "Hundred ";
                n = n % 100;
            }
            if (n > 19) {
                res += b[Math.floor(n / 10)] + " ";
                if (n % 10 > 0) res += a[n % 10];
            } else if (n > 0) {
                res += a[n];
            }
            return res;
        };
        
        if (millions) str += convertHundreds(millions) + "Million ";
        if (thousands) str += convertHundreds(thousands) + "Thousand ";
        if (units) str += convertHundreds(units);
        
        return str.trim() + " Only";
    }

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const primaryColor = [34, 63, 122]; // #223F7A
    const secondaryColor = [128, 128, 128];

    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("MADHAWEE PRINTERS", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text("Quality Printing Solutions", 14, 25);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("GOODS RECEIVED NOTE", 14, 35);

    // Metadata grid (2 columns)
    doc.setFontSize(9);
    const leftX = 14;
    const rightX = 150;
    let currY = 45;
    const lineHeight = 6;

    const addField = (label: string, value: string, x: number, y: number) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}`, x, y);
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(`${label}`);
        doc.text(` : ${value || "-"}`, x + 40, y);
    };

    addField("PRINTED ON", format(new Date(), "dd/MM/yyyy h:mm:ss a"), leftX, currY);
    addField("GRN NO", grn.id.toString(), leftX, currY + lineHeight);
    addField("RELATED PO #", grn.releated_po, leftX, currY + lineHeight * 2);
    addField("RECEIVED DATE", grn.received_date ? format(new Date(grn.received_date), "dd/MM/yyyy") : "-", leftX, currY + lineHeight * 3);
    addField("SUPPLIERS", grn.supplier_name, leftX, currY + lineHeight * 4);
    addField("STOCK LOCATION", grn.stock_location, leftX, currY + lineHeight * 5);
    addField("REMARKS", grn.remarks || "-", leftX, currY + lineHeight * 6);

    // Right column fields
    addField("SUPPLIER INVOICE#", grn.supplier_invoice_no, rightX, currY);
    addField("PAYEE NAME", grn.payee_name, rightX, currY + lineHeight);
    addField("PAYMENT METHODS", grn.payment_method, rightX, currY + lineHeight * 2);
    addField("CURRENCY", grn.currency, rightX, currY + lineHeight * 3);

    // Items table
    const tableData = grn.items.map((item, index) => [
        index + 1,
        item.item_name,
        Number(item.quantity).toLocaleString(),
        Number(item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    ]);

    autoTable(doc, {
        startY: currY + lineHeight * 8,
        head: [["#", "ITEM DETAILS", "QUANTITY", "RATE", "AMOUNT"]],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255] as [number, number, number],
            fontSize: 10,
            halign: "center",
        },
        columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 110 },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
        },
        margin: { left: 14, right: 14 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const subTotal = grn.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const vatRate = 0; // Assuming 0 if not provided
    const vatAmount = subTotal * vatRate;
    const totalAmount = subTotal + vatAmount;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const totalLabelX = 230; // Increased spacing to prevent overlapping
    const totalValueX = 283; // Right align to the end of the table

    doc.text("Sub Total", totalLabelX, finalY);
    doc.text(subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }), totalValueX, finalY, { align: "right" });

    doc.text("VAT Amount", totalLabelX, finalY + lineHeight);
    doc.text(vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }), totalValueX, finalY + lineHeight, { align: "right" });

    doc.setDrawColor(200, 200, 200);
    doc.line(totalLabelX, finalY + lineHeight + 2, totalValueX, finalY + lineHeight + 2);

    doc.setFontSize(12);
    doc.text("GRN VALUE", totalLabelX, finalY + lineHeight * 2 + 2);
    doc.text(`${grn.currency} ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, totalValueX, finalY + lineHeight * 2 + 2, { align: "right" });

    // Display Amount in Words
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Amount in words:", 14, finalY);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${grn.currency} ${numberToWords(totalAmount)}`, 14, finalY + 5);

    doc.setTextColor(0, 0, 0); // Reset for later text
    // Footer signature lines
    const footerY = 180;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    doc.line(20, footerY, 70, footerY);
    doc.text("Prepared By", 45, footerY + 5, { align: "center" });

    doc.line(110, footerY, 180, footerY);
    doc.text("Store Keeper / Approved By", 145, footerY + 5, { align: "center" });

    doc.line(220, footerY, 270, footerY);
    doc.text("Manager", 245, footerY + 5, { align: "center" });

    // Legal notice
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const bottomY = 195;
    doc.text("COMPUTER GENERATED DOCUMENT. NO SIGNATURES REQUIRED. PLEASE DO NOT ACCEPT THIS DOCUMENT IF THE STATUS IS MARKED AS 'UN-PROCESSED'", 148, bottomY, { align: "center" });

    doc.save(`GRN_${grn.id}_${grn.supplier_name.replace(/\s+/g, '_')}.pdf`);
};
