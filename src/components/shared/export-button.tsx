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
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import { generateReportPdf } from "@/lib/report-pdf";

interface ExportButtonProps {
    data: Record<string, unknown>[];
    filename: string;
    onPrint?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, onPrint }) => {
    const exportToXLSX = () => {
        if (!data || data.length === 0) return;

        const rowsToExport: Record<string, any>[] = [];
        // Positions of job breakdown rows, so they can be grouped under their item in Excel
        const jobRowIndexes: number[] = [];

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
                    jobRowIndexes.push(rowsToExport.length);
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

        // Group job rows under their item so Excel shows the +/- outline buttons in the margin.
        // "above" puts the button on the item row itself; Excel otherwise expects the summary
        // row to sit below its detail rows.
        if (jobRowIndexes.length > 0) {
            const sheetRows: XLSX.RowInfo[] = [];
            // +1 because json_to_sheet writes the column names as the first row
            jobRowIndexes.forEach((index) => {
                sheetRows[index + 1] = { level: 1 };
            });
            worksheet["!rows"] = sheetRows;
            (worksheet as XLSX.WorkSheet & {
                "!outline"?: { above?: boolean; left?: boolean };
            })["!outline"] = { above: true };
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const exportToPDF = async () => {
        try {
            await generateReportPdf(data, filename);
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
                Print report
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
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
