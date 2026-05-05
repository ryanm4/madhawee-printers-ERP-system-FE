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
    const exportToCSV = () => {
        if (!data || data.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (!data || data.length === 0) return;

        try {
            const doc = new jsPDF({ orientation: "landscape" });
            const keys = Object.keys(data[0]);

            // Format headers for display
            const headers = keys.map(key => key.replace(/_/g, ' ').toUpperCase());

            // Map data to rows
            const rows = data.map(item => keys.map(key => String(item[key] ?? "")));

            // Add title
            doc.setFontSize(18);
            doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);

            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: 30,
                styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
                headStyles: { fillColor: [34, 63, 122], textColor: [255, 255, 255], minCellWidth: 15 },
                alternateRowStyles: { fillColor: [234, 236, 242] },
                margin: { top: 30, left: 10, right: 10 },
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
                <DropdownMenuItem onClick={exportToCSV}>
                    Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                    Download as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
