"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardPlus, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { PurchaseOrderStatus } from "@/config/enum";
import type { PURCHASE_ORDER } from "@/modules/purchase-order/types";
import { cn } from "@/lib/utils";
import { Tile, TileHeader } from "./tile";

const PER_PAGE = 5;

const showDate = (value?: Date | string | null) => (value ? format(new Date(value), "dd MMM yyyy") : "Not set");

/** "Overdue by 3 days", "Due today", "Due in 5 days" from the delivery date */
const dueNote = (value?: Date | string | null) => {
  if (!value) return null;
  const days = differenceInCalendarDays(startOfDay(new Date(value)), startOfDay(new Date()));
  if (days < 0) return { text: `Overdue by ${-days} ${days === -1 ? "day" : "days"}`, late: true };
  if (days === 0) return { text: "Due today", late: true };
  return { text: `Due in ${days} ${days === 1 ? "day" : "days"}`, late: false };
};

/** Delivery date for sorting; orders without one go last */
const dueTime = (po: PURCHASE_ORDER) => (po.delivery_date ? new Date(po.delivery_date).getTime() : Infinity);

/**
 * Purchase orders still open with no job ticket made for them yet, soonest delivery first.
 * Not tied to the dashboard's date range: an order waiting for a job matters whenever it came in.
 */
export function OrdersWithoutJobs({ className, canCreateJob }: { className?: string; canCreateJob: boolean }) {
  const [orders, setOrders] = useState<PURCHASE_ORDER[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    purchaseOrderApi
      .getAll()
      .then((response) => {
        if (cancelled) return;
        const waiting = (response.data ?? [])
          .filter((po) => (po.jobs ?? []).length === 0 && po.status !== PurchaseOrderStatus.COMPLETED)
          .sort((a, b) => dueTime(a) - dueTime(b));
        setOrders(waiting);
      })
      .catch((error) => {
        console.error("Orders without jobs fetch failed:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = orders?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(count / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = (orders ?? []).slice(start, start + PER_PAGE);

  return (
    <Tile className={className}>
      <TileHeader icon={FileWarning} title="Orders waiting for job tickets" href="/purchase-order" linkLabel="Purchase orders" />

      {orders === null && !failed ? (
        <div className="flex items-center gap-2 py-10 text-sm text-[#5B6474]" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Checking purchase orders
        </div>
      ) : failed ? (
        <p className="py-10 text-sm text-[#B91C1C]">Couldn&apos;t load purchase orders. Refresh the page to try again.</p>
      ) : count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <CheckCircle2 className="size-8 text-[#16A34A]/70" aria-hidden />
          <p className="text-sm font-medium text-[#1B2433]">Every open order has a job ticket.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-[#D97706] tabular-nums">{count.toLocaleString()}</p>
            <p className="text-sm text-[#5B6474]">
              {count === 1 ? "order has" : "orders have"} no job ticket yet
            </p>
          </div>

          <div className="mt-4 hidden grid-cols-[minmax(9rem,1fr)_minmax(10rem,1.6fr)_7.5rem_10rem_8.5rem] gap-x-4 border-b border-[#EEF1F6] pb-2 text-[13px] font-medium text-[#5B6474] md:grid">
            <span>PO number</span>
            <span>Customer</span>
            <span>Ordered on</span>
            <span>Delivery date</span>
            <span className="sr-only">Action</span>
          </div>
          <ul className="divide-y divide-[#EEF1F6]">
            {visible.map((po) => {
              const due = dueNote(po.delivery_date);
              return (
                <li
                  key={po.po_id}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-sm md:grid-cols-[minmax(9rem,1fr)_minmax(10rem,1.6fr)_7.5rem_10rem_8.5rem]"
                >
                  <Link
                    href={`/purchase-order/${po.po_id}/view`}
                    className="truncate font-semibold text-[#223F7A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30"
                  >
                    {po.customer_po || `PO #${po.po_id}`}
                  </Link>
                  <span className="col-start-1 truncate text-[#1B2433] md:col-start-auto">{po.customer?.name || "No customer"}</span>
                  <span className="col-start-1 text-[#5B6474] md:col-start-auto md:text-[#1B2433]">
                    <span className="md:hidden">Ordered </span>
                    {showDate(po.po_date)}
                  </span>
                  <span className="col-start-1 flex flex-col md:col-start-auto">
                    <span className="text-[#1B2433]">
                      <span className="text-[#5B6474] md:hidden">Delivery </span>
                      {showDate(po.delivery_date)}
                    </span>
                    {due && (
                      <span className={cn("text-xs font-medium", due.late ? "text-[#B91C1C]" : "text-[#5B6474]")}>
                        {due.text}
                      </span>
                    )}
                  </span>
                  {canCreateJob ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="col-start-2 row-span-4 row-start-1 h-8 justify-self-end rounded-lg border-[#E4E8F0] md:col-start-auto md:row-span-1 md:row-start-auto"
                    >
                      <Link href={`/job-ticket/create?po=${po.po_id}`}>
                        <ClipboardPlus className="size-4" aria-hidden />
                        Create job
                      </Link>
                    </Button>
                  ) : (
                    <span aria-hidden className="hidden md:block" />
                  )}
                </li>
              );
            })}
          </ul>
          {count > PER_PAGE && (
            <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#EEF1F6] pt-3">
              <span className="mr-1 text-xs text-[#5B6474] tabular-nums">
                {start + 1}–{Math.min(start + PER_PAGE, count)} of {count}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg border-[#E4E8F0]"
                aria-label="Previous orders"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg border-[#E4E8F0]"
                aria-label="Next orders"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </Tile>
  );
}
