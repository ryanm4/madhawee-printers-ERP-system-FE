"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Building2, ChevronDown, ChevronRight, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateJobDeliveryPdf, type JobDeliveryGroup } from "@/lib/report-pdf";
import { getErrorMessage } from "@/lib/error-utils";
import { cn } from "@/lib/utils";
import type { JobDeliveryRow } from "@/modules/reports/types";

const qty = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const showDate = (value: string | null) => (value ? format(new Date(`${value}T00:00:00`), "dd MMM yyyy") : "-");

const totals = (rows: JobDeliveryRow[]) =>
  rows.reduce(
    (t, r) => ({ order: t.order + r.order_qty, delivered: t.delivered + r.delivery_qty, balance: t.balance + r.balance_qty }),
    { order: 0, delivered: 0, balance: 0 }
  );

const GRID = "grid grid-cols-[minmax(8.5rem,1fr)_7rem_minmax(12rem,2.6fr)_6.5rem_6.5rem_6.5rem] items-center gap-x-4";

/**
 * Job Delivery Summary on screen: one collapsible section per customer, each listing its jobs with
 * ordered, delivered and balance quantities and a subtotal. Exported as a PDF only, with every
 * customer's section printed in full.
 */
export function JobDeliveryReport({
  rows,
  filename,
  subtitle,
}: {
  rows: JobDeliveryRow[];
  filename: string;
  /** Dates and filters used, printed under the PDF title */
  subtitle: string;
}) {
  const groups = useMemo(() => {
    const byCustomer = new Map<string, JobDeliveryRow[]>();
    rows.forEach((row) => {
      const key = row.customer_name || "No customer";
      byCustomer.set(key, [...(byCustomer.get(key) ?? []), row]);
    });
    return [...byCustomer.entries()].map(([customer, jobs]) => ({ customer, rows: jobs }));
  }, [rows]);

  const [open, setOpen] = useState<Set<string>>(() => new Set(groups.slice(0, 1).map((g) => g.customer)));
  const [exporting, setExporting] = useState(false);
  const all = totals(rows);
  const allOpen = open.size === groups.length;

  const toggle = (customer: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(customer)) next.delete(customer);
      else next.add(customer);
      return next;
    });

  const downloadPdf = async () => {
    setExporting(true);
    try {
      await generateJobDeliveryPdf(groups as JobDeliveryGroup[], filename, subtitle);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't create the PDF"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#14213D]">Job Delivery Summary</h2>
          <p className="text-sm text-[#4B5567]">
            {rows.length} {rows.length === 1 ? "job" : "jobs"} for {groups.length}{" "}
            {groups.length === 1 ? "customer" : "customers"}. {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.customer)))}
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
          <Button onClick={downloadPdf} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            Download PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E4E8F0] bg-white">
        <div className="min-w-[760px]">
          <div className={cn(GRID, "border-b border-[#E4E8F0] bg-[#F7F8FA] px-4 py-2.5 text-[13px] font-medium text-[#4B5567]")}>
            <span className="pl-8">Job No</span>
            <span>Job Open Date</span>
            <span>Job Name</span>
            <span className="text-right">Order Qty</span>
            <span className="text-right">Delivery Qty</span>
            <span className="text-right">Balance Qty</span>
          </div>

          <ul className="divide-y divide-[#E4E8F0]">
            {groups.map((group) => {
              const expanded = open.has(group.customer);
              const t = totals(group.rows);
              const panelId = `jds-${group.customer.replace(/\W+/g, "-")}`;
              return (
                <li key={group.customer}>
                  <button
                    type="button"
                    onClick={() => toggle(group.customer)}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    className={cn(
                      GRID,
                      "w-full px-4 py-3 text-left text-sm hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#223F7A]/30",
                      expanded && "bg-[#F7F9FC]"
                    )}
                  >
                    <span className="col-span-3 flex min-w-0 items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#EDF0F5] text-[#4B5567]">
                        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </span>
                      <Building2 className="size-4 shrink-0 text-[#4B5567]" aria-hidden />
                      <span className="truncate font-semibold text-[#14213D]">{group.customer}</span>
                      <span className="shrink-0 rounded bg-[#EDF0F5] px-1.5 text-xs font-semibold text-[#14213D]">
                        {group.rows.length} {group.rows.length === 1 ? "job" : "jobs"}
                      </span>
                    </span>
                    <span className="text-right font-semibold tabular-nums text-[#14213D]">{qty(t.order)}</span>
                    <span className="text-right font-semibold tabular-nums text-[#14213D]">{qty(t.delivered)}</span>
                    <span className={cn("text-right font-semibold tabular-nums", t.balance < 0 ? "text-[#B42318]" : "text-[#14213D]")}>
                      {qty(t.balance)}
                    </span>
                  </button>

                  {expanded && (
                    <ul id={panelId} className="divide-y divide-[#EEF1F5] border-t border-[#EEF1F5] bg-white">
                      {group.rows.map((row) => (
                        <li key={row.job_id} className={cn(GRID, "px-4 py-2.5 text-sm")}>
                          <span className="pl-8 font-medium text-[#14213D]">{row.job_number || "-"}</span>
                          <span className="text-[#14213D]">{showDate(row.job_open_date)}</span>
                          <span className="min-w-0 text-[#14213D]" title={row.job_name ?? undefined}>
                            <span className="line-clamp-2">{row.job_name || "-"}</span>
                          </span>
                          <span className="text-right tabular-nums">{qty(row.order_qty)}</span>
                          <span className="text-right tabular-nums">{qty(row.delivery_qty)}</span>
                          <span
                            className={cn(
                              "text-right font-medium tabular-nums",
                              row.balance_qty < 0 ? "text-[#B42318]" : row.balance_qty === 0 ? "text-[#15803D]" : "text-[#14213D]"
                            )}
                          >
                            {qty(row.balance_qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={cn(GRID, "border-t border-[#C9D3E3] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#14213D]")}>
            <span className="col-span-3 pl-8">Grand total</span>
            <span className="text-right tabular-nums">{qty(all.order)}</span>
            <span className="text-right tabular-nums">{qty(all.delivered)}</span>
            <span className={cn("text-right tabular-nums", all.balance < 0 && "text-[#B42318]")}>{qty(all.balance)}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-[#4B5567]">
        Completed jobs are left out. Delivery Qty counts every dispatch made for the job so far. A balance of 0 means fully delivered; a
        negative balance means more was dispatched than ordered.
      </p>
    </div>
  );
}
