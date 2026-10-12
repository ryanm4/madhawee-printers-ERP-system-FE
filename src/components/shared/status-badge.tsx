import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "QUOTATION"
  | "PURCHASE_ORDER"
  | "JOB_TICKET"
  | "CUSTOMER"
  | "INVENTORY"
  | "TAX"
  | "DISPATCH_INVOICE";

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
  /** Text to show instead of the raw status, e.g. "In production" */
  label?: string;
}

const statusStyles: Record<string, string> = {
  // General Statuses
  "PENDING": "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  "CREATED": "border-blue-200 bg-blue-50 text-[#223F7A] hover:bg-blue-100",
  "APPROVED": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  "ACCEPTED": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  "COMPLETED": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  "REJECTED": "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",

  // Job Ticket specific
  "MATERIALS REQUESTED": "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  "MATERIALS ALLOCATED": "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100",
  "IN PRINTING": "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
  "PRINTING COMPLETED": "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100",
  "PARTIALLY DISPATCHED": "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100",
  "PARTIALLY DISPATHCED": "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100",
  "DISPATCHED": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",

  // Customer specific
  "ACTIVE": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  "INACTIVE": "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",

  // Inventory specific
  "IN_STOCK": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  "LOW_STOCK": "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  "OUT_OF_STOCK": "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",

  // Tax Types
  "VAT": "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  "SVAT": "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  "NON": "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
  "NONE": "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
};

// Codes that read as abbreviations stay in capitals; everything else is sentence case
const KEEP_UPPERCASE = new Set(["VAT", "SVAT", "NON", "NONE", "TIEP", "NON-TIEP", "MP", "LKR", "USD"]);

const toLabel = (status: string) => {
  const upper = status.toUpperCase();
  if (KEEP_UPPERCASE.has(upper)) return upper;
  const text = status.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  if (!status) return null;
  const normalizedStatus = status.toUpperCase();
  const style = statusStyles[normalizedStatus] || "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 border font-semibold shadow-none transition-colors whitespace-nowrap",
        // Default size/rounding if no specific classes provided
        !className?.includes("text-") && "text-xs",
        !className?.includes("px-") && "px-2",
        !className?.includes("py-") && "py-0.5",
        !className?.includes("rounded-") && "rounded-md",
        style,
        className
      )}
    >
      {/* Small dot in the badge colour, matching the status dots on cards */}
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />
      {label ?? toLabel(status)}
    </Badge>
  );
}
