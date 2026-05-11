import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { IssueNote } from "./types";

export const generateIssueNotePdf = (issueNote: IssueNote) => {
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
    doc.text("ISSUE NOTE", 14, 35);

    // Metadata grid
    doc.setFontSize(9);
    const leftX = 14;
    const rightX = 150;
    const currY = 45;
    const lineHeight = 6;

    const addField = (label: string, value: string, x: number, y: number, labelOffset = 45) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}`, x, y);
        doc.setFont("helvetica", "normal");
        doc.text(` : ${value || "-"}`, x + labelOffset, y);
    };

    addField("PRINTED ON", format(new Date(), "dd/MM/yyyy h:mm:ss a"), leftX, currY);
    addField("GOODS ISSUE NOTE NO", issueNote.id.toString(), leftX, currY + lineHeight);
    addField("DATE", issueNote.date ? format(new Date(issueNote.date), "dd/MM/yyyy") : "-", leftX, currY + lineHeight * 2);
    addField("RELATED JOB", issueNote.job_name || (issueNote.job_id ? `Job #${issueNote.job_id}` : "-"), leftX, currY + lineHeight * 3);
    addField("JOB NUMBER", (issueNote as any).job_number || "-", leftX, currY + lineHeight * 4);

    // Right column fields
    addField("REMARKS", issueNote.remarks, rightX, currY + lineHeight, 45);
    addField("DRIVER OR COLLECTOR", issueNote.collector_name, rightX, currY + lineHeight * 2, 45);

    // Items table
    const tableData = issueNote.items.map((item, index) => [
        index + 1,
        item.item_name,
        (item as any).unit_of_measure || "-",
        Number(item.quantity).toLocaleString(),
    ]);

    autoTable(doc, {
        startY: currY + lineHeight * 5,
        head: [["NO", "Item", "Unit", "Quantity"]],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255] as [number, number, number],
            fontSize: 10,
        },
        columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 160, halign: "left" },
            2: { cellWidth: 30, halign: "left" },
            3: { halign: "left" },
        },
        margin: { left: 14, right: 14 },
    });

    // Footer signature lines
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 30; // some gap from table
    const footerY = Math.max(finalY, 160); // Keep it around bottom, but adapt if table is long

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.line(20, footerY, 70, footerY);
    doc.text("Prepared By", 45, footerY + 5, { align: "center" });

    doc.line(110, footerY, 180, footerY);
    doc.text("Store Keeper / Approved By", 145, footerY + 5, { align: "center" });

    doc.line(220, footerY, 270, footerY);
    doc.text("Received by", 245, footerY + 5, { align: "center" });

    // Legal notice
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const bottomY = footerY + 15;
    doc.text("COMPUTER GENERATED DOCUMENT. NO SIGNATURES REQUIRED. PLEASE DO NOT ACCEPT THIS DOCUMENT IF THE STATUS IS MARKED AS 'UN-PROCESSED'", 148, bottomY, { align: "center" });

    doc.save(`IssueNote_${issueNote.id}_${new Date().getTime()}.pdf`);
};
