import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";

interface ExportButtonProps {
    data: Record<string, unknown>[];
    filename: string;
    onPrint?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, onPrint }) => {
    const exportToXLSX = () => {
        if (!data || data.length === 0) return;

        const rowsToExport: Record<string, any>[] = [];

        data.forEach((item) => {
            const rowCopy: Record<string, any> = {};
            Object.keys(item).forEach((k) => {
                if (k !== "jobs") {
                    rowCopy[k] = item[k];
                }
            });
            rowsToExport.push(rowCopy);

            if (Array.isArray(item.jobs) && item.jobs.length > 0) {
                const keys = Object.keys(item).filter((k) => k !== "jobs");
                item.jobs.forEach((job: any, idx: number) => {
                    const subRow: Record<string, any> = {};
                    keys.forEach((key) => {
                        const kLower = key.toLowerCase();
                        if (key === "#") subRow[key] = `   ↳ ${idx + 1}`;
                        else if (kLower.includes("category") && !kLower.includes("sub")) subRow[key] = `Job #: ${job.job_number || "-"}`;
                        else if (kLower.includes("sub") || kLower.includes("note")) subRow[key] = `Note #: ${job.issue_note_no || "-"}`;
                        else if (kLower.includes("name") || kLower.includes("description") || kLower.includes("item")) subRow[key] = job.job_name || "-";
                        else if (kLower.includes("size") || kLower.includes("date")) subRow[key] = `Date: ${job.issue_date || "-"}`;
                        else if (kLower.includes("uom") || kLower.includes("unit of measure")) subRow[key] = "";
                        else if (kLower.includes("qty") || kLower.includes("quantity") || kLower.includes("consumed")) subRow[key] = job.consumed_qty;
                        else if (kLower.includes("rate") || kLower.includes("price") || kLower.includes("unit")) subRow[key] = job.unit_rate;
                        else if (kLower.includes("amount") || kLower.includes("total") || kLower.includes("value") || kLower.includes("cost")) subRow[key] = job.total_value;
                        else subRow[key] = "";
                    });
                    rowsToExport.push(subRow);
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(rowsToExport);

        // Adjust column widths based on maximum string lengths
        const colWidths = Object.keys(rowsToExport[0] || {}).map((key) => {
            let maxLen = key.length + 4;
            rowsToExport.forEach((r) => {
                const val = String(r[key] ?? "");
                if (val.length + 4 > maxLen) {
                    maxLen = Math.min(val.length + 4, 60);
                }
            });
            return { wch: Math.max(maxLen, 12) };
        });
        worksheet["!cols"] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const getLogoDataUrl = (): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = "/images/madhawee_logo.svg";
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const scale = 5;
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth * scale;
                canvas.height = img.naturalHeight * scale;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.scale(scale, scale);
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/png", 1.0));
                } else {
                    resolve("");
                }
            };
            img.onerror = () => {
                resolve("");
            };
        });
    };

    const exportToPDF = async () => {
        if (!data || data.length === 0) return;

        try {
            const doc = new jsPDF({ orientation: "landscape" });

            const firstItem = data[0];
            const keys = Object.keys(firstItem).filter((k) => k !== "jobs");
            const headers = keys.map((key) => key.replace(/_/g, " ").toUpperCase());

            const pdfRows: any[][] = [];

            data.forEach((item) => {
                const mainRow = keys.map((key) => String(item[key] ?? ""));
                pdfRows.push(mainRow);

                if (Array.isArray(item.jobs) && item.jobs.length > 0) {
                    item.jobs.forEach((job: any, jIdx: number) => {
                        const jobRow = keys.map((key) => {
                            const kLower = key.toLowerCase();
                            if (key === "#") return `  ↳ ${jIdx + 1}`;
                            if (kLower.includes("category") && !kLower.includes("sub")) return `Job: ${job.job_number || "-"}`;
                            if (kLower.includes("sub") || kLower.includes("note")) return `Note: ${job.issue_note_no || "-"}`;
                            if (key === "Item Name" || kLower.includes("description") || (kLower.includes("name") && !kLower.includes("category"))) return `${job.job_name || "-"}`;
                            if (kLower.includes("size") || kLower.includes("date")) return `Date: ${job.issue_date || "-"}`;
                            if (kLower.includes("uom") || kLower.includes("unit of measure")) return "";
                            if (kLower.includes("qty") || kLower.includes("quantity") || kLower.includes("consumed")) return String(job.consumed_qty ?? "");
                            if (kLower.includes("rate") || kLower.includes("price") || (kLower.includes("unit") && !kLower.includes("measure"))) return String(job.unit_rate ?? "");
                            if (kLower.includes("amount") || kLower.includes("total") || kLower.includes("value") || kLower.includes("cost")) return String(job.total_value ?? "");
                            return "";
                        });
                        pdfRows.push(jobRow);
                    });
                }
            });

            try {
                const logoDataUrl = await getLogoDataUrl();
                if (logoDataUrl) {
                    doc.addImage(logoDataUrl, "PNG", 14, 10, 36, 12);
                }
            } catch (err) {
                console.error("Failed to load logo in PDF", err);
            }

            doc.setFontSize(14);
            doc.text(filename.replace(/_/g, " ").replace(/-/g, " ").toUpperCase(), 14, 28);
            doc.setFontSize(9);
            doc.setTextColor(100);

            const fontSize = keys.length > 10 ? 6 : keys.length > 7 ? 7 : 8;
            const headFontSize = fontSize + 0.5;

            autoTable(doc, {
                head: [headers],
                body: pdfRows,
                startY: 34,
                styles: { fontSize: fontSize, cellPadding: 2, overflow: "linebreak" },
                headStyles: { fillColor: [34, 63, 122], textColor: [255, 255, 255], fontStyle: "bold", fontSize: headFontSize },
                alternateRowStyles: { fillColor: [248, 249, 252] },
                didParseCell: function (dataCell) {
                    const rowRaw = pdfRows[dataCell.row.index];
                    if (rowRaw && typeof rowRaw[0] === "string" && rowRaw[0].includes("↳")) {
                        dataCell.cell.styles.fontStyle = "italic";
                        dataCell.cell.styles.fontSize = Math.max(fontSize - 0.5, 6);
                        dataCell.cell.styles.textColor = [70, 80, 100];
                        dataCell.cell.styles.fillColor = [240, 244, 250];
                    }
                },
                margin: { top: 34, left: 8, right: 8 },
            });

            doc.save(`${filename}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error(getErrorMessage(error, "Failed to generate PDF"));
        }
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Report
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Data
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToXLSX}>
                        Download as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToPDF}>
                        Download as PDF
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
