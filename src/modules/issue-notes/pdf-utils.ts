import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { IssueNote } from "./types";

const loadLogoAsDataUrl = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Use a high-res canvas for crisp output
      const scale = 2;
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = "/images/madhawee_logo.svg";
  });
};

export const generateIssueNotePdf = async (issueNote: IssueNote) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  console.log(issueNote);

  const primaryColor = [34, 63, 122]; // #223F7A
  const secondaryColor = [128, 128, 128];

  // Try to load and embed the company logo
  const logoDataUrl = await loadLogoAsDataUrl();
  let headerYOffset = 20;

  if (logoDataUrl) {
    try {
      // The SVG logo aspect ratio is roughly 407.97 x 59.61 ≈ 6.84:1
      const logoWidth = 80;
      const logoHeight = logoWidth / 6.84;
      doc.addImage(logoDataUrl, "PNG", 14, 10, logoWidth, logoHeight);
      headerYOffset = 10 + logoHeight + 5;
    } catch (e) {
      console.error("Error embedding logo in issue note PDF", e);
      // Fallback to text header
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("MADHAWEE PRINTERS", 14, 20);
      headerYOffset = 25;
    }
  } else {
    // Fallback to text header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("MADHAWEE PRINTERS", 14, 20);
    headerYOffset = 25;
  }

  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Quality Printing Solutions", 14, headerYOffset);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("ISSUE NOTE", 14, headerYOffset + 10);

  // Metadata grid
  doc.setFontSize(9);
  const leftX = 14;
  const rightX = 150;
  const currY = headerYOffset + 20;
  const lineHeight = 6;

  const addField = (
    label: string,
    value: string,
    x: number,
    y: number,
    labelOffset = 45
  ) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}`, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(` : ${value || "-"}`, x + labelOffset, y);
  };

  addField(
    "PRINTED ON",
    format(new Date(), "dd/MM/yyyy h:mm:ss a"),
    leftX,
    currY
  );
  addField(
    "GOODS ISSUE NOTE NO",
    issueNote.id.toString(),
    leftX,
    currY + lineHeight
  );
  addField(
    "DATE",
    issueNote.date ? format(new Date(issueNote.date), "dd/MM/yyyy") : "-",
    leftX,
    currY + lineHeight * 2
  );
  addField(
    "JOB NUMBER",
    (issueNote as any).job_number || "-",
    leftX,
    currY + lineHeight * 3
  );
  addField(
    "RELATED JOB",
    issueNote.job_name || (issueNote.job_id ? `Job #${issueNote.job_id}` : "-"),
    leftX,
    currY + lineHeight * 4
  );

  // Right column fields
  addField("REMARKS", issueNote.remarks, rightX, currY + lineHeight, 45);
  addField(
    "DRIVER OR COLLECTOR",
    issueNote.collector_name,
    rightX,
    currY + lineHeight * 2,
    45
  );

  // Items table
  const tableData = issueNote.items.map((item, index) => [
    index + 1,
    item.item_name,
    (item as any).item_size || "-",
    (item as any).unit_of_measure || "-",
    Number(item.quantity).toLocaleString(),
  ]);

  autoTable(doc, {
    startY: currY + lineHeight * 5,
    head: [["NO", "Item", "Size", "Unit", "Quantity"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 120, halign: "left" },
      2: { cellWidth: 40, halign: "left" },
      3: { cellWidth: 30, halign: "left" },
      4: { halign: "left" },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer signature lines
  const finalY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 30; // some gap from table
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
  doc.text(
    "COMPUTER GENERATED DOCUMENT. NO SIGNATURES REQUIRED. PLEASE DO NOT ACCEPT THIS DOCUMENT IF THE STATUS IS MARKED AS 'UN-PROCESSED'",
    148,
    bottomY,
    { align: "center" }
  );

  doc.save(`IssueNote_${issueNote.id}_${new Date().getTime()}.pdf`);
};
