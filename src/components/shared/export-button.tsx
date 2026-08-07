import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";

interface ExportButtonProps {
    data: Record<string, unknown>[];
    filename: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename }) => {
    const exportToXLSX = () => {
        if (!data || data.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const getLogoDataUrl = (): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = "/images/madhawee_logo.svg";
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const scale = 5; // Scale up for higher resolution in PDF
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
            const keys = Object.keys(data[0]);

            // Format headers for display
            const headers = keys.map(key => key.replace(/_/g, ' ').toUpperCase());

            // Map data to rows
            const rows = data.map(item => keys.map(key => String(item[key] ?? "")));

            // Add logo if available
            try {
                const logoDataUrl = await getLogoDataUrl();
                if (logoDataUrl) {
                    doc.addImage(logoDataUrl, "PNG", 14, 10, 36, 12);
                }
            } catch (err) {
                console.error("Failed to load logo in PDF", err);
            }

            // Add title
            doc.setFontSize(14);
            doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 28);
            doc.setFontSize(10);
            doc.setTextColor(100);

            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: 34,
                styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
                headStyles: { fillColor: [34, 63, 122], textColor: [255, 255, 255], minCellWidth: 15 },
                alternateRowStyles: { fillColor: [234, 236, 242] },
                margin: { top: 34, left: 10, right: 10 },
                horizontalPageBreak: true,
                horizontalPageBreakRepeat: 0,
            });

            doc.save(`${filename}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error(getErrorMessage(error, "Failed to generate PDF"));
        }
    };

    return (
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
    );
};
