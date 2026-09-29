import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const RIGHT_ALIGNED_COLUMNS = [
    "Total Sales", "Unit Price", "Revenue", "Rate", "PO Grand Total",
    "Sub Total", "Total Without Tax", "Net Total", "Amount", "Unit Rate",
    "Total Quantity", "Quantity", "Available Qty", "Dispatch Qty", "Order Qty", "Balance Qty",
    "Stock Value", "Consumed Qty", "Reorder Level", "Total Cost", "Total Amount"
];

type RGB = [number, number, number];

interface JobBreakdown {
    job_number?: string;
    issue_note_no?: string;
    job_name?: string;
    issue_date?: string;
    consumed_qty?: number | string;
    unit_rate?: number | string;
    total_value?: number | string;
}

const COLORS = {
    brand: [3, 70, 147] as RGB,       // #034693 — logo navy
    ink: [34, 38, 46] as RGB,         // #22262E
    muted: [107, 114, 128] as RGB,    // #6B7280
    rule: [213, 220, 230] as RGB,     // #D5DCE6
    zebra: [244, 247, 251] as RGB,    // #F4F7FB
    subRow: [236, 241, 248] as RGB,   // #ECF1F8
    negative: [180, 35, 24] as RGB,   // #B42318
};

// Process colours for the press-sheet colour bar under the header
const CMYK_BAR: RGB[] = [
    [0, 174, 239],
    [236, 0, 140],
    [255, 222, 0],
    [35, 31, 32],
];

const LOGO_ASPECT = 407.97 / 59.61;
const MARGIN_X = 14;
const TABLE_TOP = 36;

const ACRONYMS = new Set(["id", "po", "grn", "uom", "vat", "lkr", "usd", "gsm", "tiep"]);
const ID_LIKE = /(^#$)|(\b(id|no|number|phone|mobile|tel|year|code|ref)\.?$)/i;
const NUMERIC_VALUE = /^(?:[A-Z]{3}\s)?-?[\d,]*\.?\d+$/;
// Columns whose content fits within this width (mm) are kept on one line
const SHORT_COLUMN_MAX = 32;
const MIN_WRAP_COLUMN = 20;
// Single-token values (emails, VAT numbers) this narrow are never broken mid-word
const UNBREAKABLE_COLUMN_MAX = 55;

const isRightAlignedName = (key: string) => {
    const normalized = key.replace(/_/g, " ").toLowerCase();
    return RIGHT_ALIGNED_COLUMNS.some((c) => c.toLowerCase() === normalized);
};

const formatHeader = (key: string) => {
    const spaced = key.replace(/_/g, " ").trim();
    if (spaced !== spaced.toLowerCase()) return spaced;
    return spaced
        .split(/\s+/)
        .map((word, i) => {
            if (ACRONYMS.has(word)) return word.toUpperCase();
            return i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        })
        .join(" ");
};

export const titleFromFilename = (filename: string) => {
    const base = filename.replace(/[_-]\d{4}-\d{2}-\d{2}$/, "").replace(/[_-]+/g, " ").trim();
    if (!base) return "Report";
    return base === base.toLowerCase() ? base.charAt(0).toUpperCase() + base.slice(1) : base;
};

const withThousands = (value: string) => {
    if (!/^-?\d+(\.\d+)?$/.test(value)) return value;
    const [int, dec] = value.split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec !== undefined ? `${grouped}.${dec}` : grouped;
};

const toCellText = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) {
        const parts = value
            .map((v) => (v && typeof v === "object" ? (v as { name?: unknown }).name : v))
            .filter((v) => v !== null && v !== undefined && v !== "" && typeof v !== "object");
        return parts.length > 0 ? parts.join(", ") : "-";
    }
    if (typeof value === "object") return "-";
    const str = String(value);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) return str.split("T")[0];
    return str;
};

const subRowCell = (key: string, job: JobBreakdown, index: number) => {
    const kLower = key.toLowerCase();
    if (key === "#") return `   ${index + 1}`;
    if (kLower.includes("category") && !kLower.includes("sub")) return `Job: ${job.job_number || "-"}`;
    if (kLower.includes("sub") || kLower.includes("note")) return `Note: ${job.issue_note_no || "-"}`;
    if (key === "Item Name" || kLower.includes("description") || (kLower.includes("name") && !kLower.includes("category"))) return `${job.job_name || "-"}`;
    if (kLower.includes("size") || kLower.includes("date")) return `Date: ${job.issue_date || "-"}`;
    if (kLower.includes("uom") || kLower.includes("unit of measure")) return "";
    if (kLower.includes("qty") || kLower.includes("quantity") || kLower.includes("consumed")) return String(job.consumed_qty ?? "");
    if (kLower.includes("rate") || kLower.includes("price") || (kLower.includes("unit") && !kLower.includes("measure"))) return String(job.unit_rate ?? "");
    if (kLower.includes("amount") || kLower.includes("total") || kLower.includes("value") || kLower.includes("cost")) return String(job.total_value ?? "");
    return "";
};

/**
 * Give short columns (IDs, phones, dates, statuses) and single-token columns (emails) exactly the
 * width their content needs so values never wrap, and share what's left between long text columns,
 * weighted toward the longer ones. Headers may wrap between words so they don't widen a column.
 */
const fitColumnWidths = (
    doc: jsPDF,
    headers: string[],
    body: string[][],
    fontSize: number,
    contentWidth: number,
): Record<number, { cellWidth: number }> => {
    const padding = 5.5;
    doc.setFontSize(fontSize);
    const natural = headers.map((header, col) => {
        doc.setFont("helvetica", "bold");
        let width = Math.max(...header.split(/\s+/).map((word) => doc.getTextWidth(word)));
        doc.setFont("helvetica", "normal");
        body.forEach((row) => (width = Math.max(width, doc.getTextWidth(row[col]))));
        return width + padding;
    });
    const unbreakable = headers.map((_, col) => body.every((row) => !/\s/.test(row[col].trim())));

    const total = natural.reduce((sum, w) => sum + w, 0);
    if (total <= contentWidth) {
        const extra = (contentWidth - total) / natural.length;
        return Object.fromEntries(natural.map((w, col) => [col, { cellWidth: w + extra }]));
    }

    const styles: Record<number, { cellWidth: number }> = {};
    const wrapCols: number[] = [];
    let fixed = 0;
    natural.forEach((w, col) => {
        if (w <= SHORT_COLUMN_MAX || (unbreakable[col] && w <= UNBREAKABLE_COLUMN_MAX)) {
            styles[col] = { cellWidth: w };
            fixed += w;
        } else {
            wrapCols.push(col);
        }
    });

    const remaining = contentWidth - fixed;
    if (remaining < wrapCols.length * MIN_WRAP_COLUMN) return {};

    const weights = wrapCols.map((col) => Math.sqrt(natural[col]));
    const weightTotal = weights.reduce((sum, w) => sum + w, 0);
    wrapCols.forEach((col, i) => {
        styles[col] = { cellWidth: Math.min(natural[col], (remaining * weights[i]) / weightTotal) };
    });

    // Columns capped at their natural width may leave slack; hand it to the remaining wrapping columns
    const used = Object.values(styles).reduce((sum, s) => sum + s.cellWidth, 0);
    const stillWrapping = wrapCols.filter((col) => styles[col].cellWidth < natural[col]);
    if (used < contentWidth && stillWrapping.length > 0) {
        const share = (contentWidth - used) / stillWrapping.length;
        stillWrapping.forEach((col) => (styles[col].cellWidth += share));
    }
    return styles;
};

let logoCache: Promise<string> | null = null;

const getLogoDataUrl = (): Promise<string> => {
    if (logoCache) return logoCache;
    logoCache = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const width = 1600;
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = Math.round(width / LOGO_ASPECT);
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve("");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
            logoCache = null;
            resolve("");
        };
        img.src = "/images/madhawee_logo.svg";
    });
    return logoCache;
};

export async function generateReportPdf(data: Record<string, unknown>[], filename: string) {
    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]).filter((k) => k !== "jobs");
    const orientation = keys.length > 5 ? "landscape" : "portrait";
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - MARGIN_X * 2;

    // Build body rows, remembering which rows are job breakdowns
    const body: string[][] = [];
    const subRows = new Set<number>();
    data.forEach((item) => {
        body.push(keys.map((key) => toCellText(item[key])));
        if (Array.isArray(item.jobs)) {
            (item.jobs as JobBreakdown[]).forEach((job, jIdx) => {
                subRows.add(body.length);
                body.push(keys.map((key) => subRowCell(key, job, jIdx)));
            });
        }
    });

    // Decide which columns are numeric: by known name, or by content when the column isn't an identifier
    const numericCols = new Set<number>();
    keys.forEach((key, col) => {
        if (isRightAlignedName(key)) return numericCols.add(col);
        if (ID_LIKE.test(key.replace(/_/g, " "))) return;
        const values = body.filter((_, i) => !subRows.has(i)).map((r) => r[col]).filter((v) => v !== "-");
        if (values.length > 0 && values.every((v) => NUMERIC_VALUE.test(v))) numericCols.add(col);
    });
    body.forEach((row) => numericCols.forEach((col) => (row[col] = withThousands(row[col]))));

    const title = titleFromFilename(filename);
    const rowCount = data.length;
    const generatedAt = format(new Date(), "d MMM yyyy, h:mm a");
    const logo = await getLogoDataUrl().catch(() => "");

    const fontSize = keys.length > 12 ? 6.5 : keys.length > 8 ? 7.5 : 8.5;
    const headers = keys.map(formatHeader);
    const columnStyles = fitColumnWidths(doc, headers, body, fontSize, contentWidth);

    const drawHeader = () => {
        if (logo) {
            const logoWidth = 44;
            doc.addImage(logo, "PNG", MARGIN_X, 11, logoWidth, logoWidth / LOGO_ASPECT);
        } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...COLORS.brand);
            doc.text("Madhawee Printers", MARGIN_X, 16);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...COLORS.ink);
        doc.text(title, MARGIN_X, 27);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text(`Generated ${generatedAt}`, pageWidth - MARGIN_X, 22, { align: "right" });
        doc.text(`${rowCount.toLocaleString()} ${rowCount === 1 ? "row" : "rows"}`, pageWidth - MARGIN_X, 27, { align: "right" });

        const segment = contentWidth / CMYK_BAR.length;
        CMYK_BAR.forEach((color, i) => {
            doc.setFillColor(...color);
            doc.rect(MARGIN_X + segment * i, 30.5, segment, 0.9, "F");
        });
    };

    autoTable(doc, {
        head: [headers],
        columnStyles,
        body,
        startY: TABLE_TOP,
        margin: { top: TABLE_TOP, left: MARGIN_X, right: MARGIN_X, bottom: 16 },
        theme: "plain",
        showHead: "everyPage",
        rowPageBreak: "avoid",
        styles: {
            font: "helvetica",
            fontSize,
            textColor: COLORS.ink,
            cellPadding: { top: 1.9, bottom: 1.9, left: 2.5, right: 2.5 },
            overflow: "linebreak",
            valign: "middle",
        },
        headStyles: {
            fontStyle: "bold",
            fontSize,
            textColor: COLORS.brand,
            fillColor: [255, 255, 255],
            lineColor: COLORS.brand,
            lineWidth: { bottom: 0.5 },
        },
        alternateRowStyles: { fillColor: COLORS.zebra },
        didParseCell: (cell) => {
            const col = cell.column.index;
            if (numericCols.has(col)) cell.cell.styles.halign = "right";
            if (cell.section !== "body") return;

            if (subRows.has(cell.row.index)) {
                cell.cell.styles.fontStyle = "italic";
                cell.cell.styles.fontSize = Math.max(fontSize - 0.5, 6);
                cell.cell.styles.textColor = COLORS.muted;
                cell.cell.styles.fillColor = COLORS.subRow;
                return;
            }

            const text = String(cell.cell.raw ?? "");
            if (numericCols.has(col) && /^(?:[A-Z]{3}\s)?-\d/.test(text)) {
                cell.cell.styles.textColor = COLORS.negative;
                cell.cell.styles.fontStyle = "bold";
            }
        },
        didDrawPage: drawHeader,
    });

    // Footer with total page count, drawn once all pages exist
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        const y = pageHeight - 9;
        doc.setDrawColor(...COLORS.rule);
        doc.setLineWidth(0.2);
        doc.line(MARGIN_X, y - 4, pageWidth - MARGIN_X, y - 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.muted);
        doc.text(`Madhawee Printers  |  ${title}`, MARGIN_X, y);
        doc.text(`Page ${page} of ${totalPages}`, pageWidth - MARGIN_X, y, { align: "right" });
    }

    doc.save(`${filename}.pdf`);
}
