import { REPORT_TYPES } from "@/config/enum";

export type ReportTab = "general" | "inventory" | "sales" | "quotation";

// Report Type Dropdown Items
export const GENERAL_REPORT_TYPES = [
    { value: "customers", label: "CUSTOMERS" },
    { value: "main_inventory", label: "MAIN INVENTORY" },
    { value: "dispatch", label: "DISPATCH" },
    { value: "jobs", label: "JOBS" },
    { value: "purchase_orders", label: "PURCHASE ORDERS" },
    { value: "quotations", label: "QUOTATIONS" },
];

export const ADVANCED_REPORT_TYPES = Object.entries(REPORT_TYPES).map(([key, label]) => ({
    value: key,
    label: label as string,
}));

export const INVENTORY_REPORT_TYPES = [
    { value: "CURRENT_STOCK", label: "Current Stock Levels" },
    { value: "STOCK_VALUE", label: "Total Stock Value" },
    { value: "STOCK_AGING", label: "Stock Aging Report" },
    { value: "LOW_STOCK", label: "Low Stock Report" },
    { value: "GRN_REPORT", label: "GRN Report" },
    { value: "MATERIAL_CONSUMPTION_SUMMARY", label: "Material Consumption Summary" },
    { value: "MATERIAL_CONSUMPTION_BY_JOB", label: "Material Consumption by Job" },
];

export const SALES_REPORT_TYPES = [
    { value: "SALES_DAILY", label: "Daily Sales" },
    { value: "SALES_WEEKLY", label: "Weekly Sales" },
    { value: "SALES_MONTHLY", label: "Monthly Sales" },
    { value: "SALES_BY_CUSTOMER", label: "Sales by Customer" },
    { value: "SALES_BY_PRODUCT", label: "Sales by Product" },
    { value: "SALES_BY_SALESPERSON", label: "Sales by Salesperson" },
];

export const QUOTATION_REPORT_TYPES = [
    { value: "QUOTATION_WEEKLY", label: "Total Quotations Issued per Week" },
    { value: "QUOTATION_MONTHLY", label: "Total Quotations Issued per Month" },
    { value: "QUOTATION_SUMMARY", label: "Approved vs Rejected Quotations Summary" },
    { value: "QUOTATION_BY_CUSTOMER", label: "Quotations by Customer" },
    { value: "QUOTATION_BY_SALESPERSON", label: "Quotations by Salesperson" },
    { value: "QUOTE_TO_PO_CONVERSION", label: "Quote to PO Conversion" },
];

export interface ReportEntry {
    /** Which form handles this report */
    tab: ReportTab;
    /** Identifies the report in the list */
    type: string;
    /** Value sent as the form's report type, when it differs from `type` */
    formType?: string;
    label: string;
    description: string;
}

export interface ReportGroup {
    label: string;
    reports: ReportEntry[];
}

// One-line hint shown under each report name in the list, keyed by "tab:type"
const DESCRIPTIONS: Record<string, string> = {
    "general:customers": "Customers and suppliers added in the period.",
    "general:main_inventory": "The full item list with sizes, rates and quantities.",
    "general:dispatch": "Every dispatch note raised in the period.",
    "general:jobs": "Every job ticket opened in the period.",
    "general:purchase_orders": "Customer purchase orders received in the period.",
    "general:quotations": "Every quotation issued in the period.",
    "general:JOB_PRODUCTION": "Jobs produced in the period, with quantities.",
    "general:QUOTATION_SUMMARY": "How quotations were answered, by customer and product type.",
    "general:QUOTE_TO_PO_CONVERSION": "How many quotations became purchase orders.",
    "general:INVENTORY_HEALTH": "Overall stock condition across categories.",
    "general:DISPATCH_INSIGHTS": "What has been dispatched, part-dispatched or is still waiting.",
    "inventory:CURRENT_STOCK": "How much of each item is in the store right now.",
    "inventory:STOCK_VALUE": "What the stock on hand is worth, item by item.",
    "inventory:STOCK_AGING": "How long items have sat since they last moved.",
    "inventory:LOW_STOCK": "Items at or below their reorder level.",
    "inventory:GRN_REPORT": "Everything received from suppliers, with quantities and cost.",
    "inventory:MATERIAL_CONSUMPTION_SUMMARY": "How much of each material was issued, and which jobs used it.",
    "inventory:MATERIAL_CONSUMPTION_BY_JOB": "The materials and cost behind each job.",
    "sales:SALES_DAILY": "Sales totals for each day.",
    "sales:SALES_WEEKLY": "Sales totals for each week.",
    "sales:SALES_MONTHLY": "Sales totals for each month.",
    "sales:SALES_BY_CUSTOMER": "Who bought the most, with currency.",
    "sales:SALES_BY_PRODUCT": "Which product types sold the most.",
    "sales:SALES_BY_SALESPERSON": "Sales brought in by each salesperson.",
    "quotation:QUOTATIONS_ISSUED": "How many quotations went out each week or month.",
    "quotation:QUOTATION_SUMMARY": "How quotations were answered.",
    "quotation:QUOTATION_BY_CUSTOMER": "Quotations sent to each customer.",
    "quotation:QUOTATION_BY_SALESPERSON": "Quotations prepared by each salesperson.",
    "quotation:QUOTE_TO_PO_CONVERSION": "How many quotations became purchase orders.",
};

/**
 * "Total Quotations Issued" is one report in the list; its Group by choice picks which of these
 * the backend runs.
 */
export const QUOTATIONS_ISSUED = "QUOTATIONS_ISSUED";
export const QUOTATIONS_ISSUED_GROUPING = [
    { value: "QUOTATION_WEEKLY", label: "Week" },
    { value: "QUOTATION_MONTHLY", label: "Month" },
];

export const reportKey = (report: Pick<ReportEntry, "tab" | "type">) => `${report.tab}:${report.type}`;

const toEntries = (tab: ReportTab, items: { value: string; label: string }[]): ReportEntry[] =>
    items.map((item) => ({
        tab,
        type: item.value,
        label: item.label,
        description: DESCRIPTIONS[`${tab}:${item.value}`] ?? "",
    }));

// Same names and grouping as the original tabs and report type dropdowns
export const REPORT_CATALOG: ReportGroup[] = [
    { label: "General Reports", reports: toEntries("general", GENERAL_REPORT_TYPES) },
    { label: "Advanced Report Types", reports: toEntries("general", ADVANCED_REPORT_TYPES) },
    { label: "Inventory Reports", reports: toEntries("inventory", INVENTORY_REPORT_TYPES) },
    { label: "Sales Reports", reports: toEntries("sales", SALES_REPORT_TYPES) },
    {
        label: "Quotations",
        reports: [
            {
                tab: "quotation",
                type: QUOTATIONS_ISSUED,
                formType: QUOTATIONS_ISSUED_GROUPING[0].value,
                label: "Total Quotations Issued",
                description: DESCRIPTIONS[`quotation:${QUOTATIONS_ISSUED}`],
            },
            ...toEntries(
                "quotation",
                QUOTATION_REPORT_TYPES.filter((r) => !QUOTATIONS_ISSUED_GROUPING.some((g) => g.value === r.value))
            ),
        ],
    },
];

export const findReport = (key: string | null) =>
    REPORT_CATALOG.flatMap((g) => g.reports).find((r) => reportKey(r) === key) ?? null;
