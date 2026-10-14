"use client";
import { useSessionStorage } from "@/hooks/use-session-storage";
import { TableSkeleton } from "@/components/shared/page-skeletons";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusIcon, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appToast } from "@/lib/toast-utils";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { PURCHASE_ORDER } from "@/modules/purchase-order/types";
import { JobTicketStatus } from "@/config/enum";
import { PurchaseOrderList } from "./_components/purchase-order-list";
import { usePermissions } from "@/hooks/use-permissions";

function PurchaseOrderPage() {
  const { canModifyPO, canCreatePO, canExportList } = usePermissions();
  const [data, setData] = useState<PURCHASE_ORDER[]>([]);
  const [loading, setLoading] = useState(true);  // starts loading: the page fetches as soon as it opens
  const [search, setSearch] = useSessionStorage("purchase-order-search", "");
  const [jobFilter, setJobFilter] = useSessionStorage<"ALL" | "OPEN" | "DONE">("purchase-order-jobs", "ALL");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderApi.getAll();

      setData([...response.data].sort((a, b) => {
        const dateA = new Date(a.created_on || a.po_date || 0).getTime();
        const dateB = new Date(b.created_on || b.po_date || 0).getTime();
        return dateB - dateA;
      }));
    } catch (err) {
      console.error("Failed to fetch POs", err);
      appToast.error("Failed to fetch purchase orders", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await purchaseOrderApi.delete(id);
      appToast.success("Purchase Order Deleted", "The purchase order has been deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Failed to delete PO:", error);
      appToast.error("Failed to Delete Purchase Order", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const searchedData = data.filter((item) => {
    const matchesSearch = !search || (() => {
      const s = search.toLowerCase();
      return (
        String(item.po_id).toLowerCase().includes(s) ||
        (item.customer?.name || "").toLowerCase().includes(s) ||
        (item.customer_po || "").toLowerCase().includes(s) ||
        (item.jobs || []).some(
          (job) => (job.job_number || "").toLowerCase().includes(s) || (job.job_name || "").toLowerCase().includes(s)
        )
      );
    })();

    const matchesDate = !date || !date.from || (() => {
      const itemDate = new Date(item.po_date || item.created_on || 0);
      const start = startOfDay(date.from!);
      const end = date.to ? endOfDay(date.to) : endOfDay(date.from!);
      return isWithinInterval(itemDate, { start, end });
    })();

    return matchesSearch && matchesDate;
  });

  // Orders with job tickets still to finish, and orders whose job tickets are all done
  const hasOpenJobs = (po: PURCHASE_ORDER) => (po.jobs || []).some((job) => job.status !== JobTicketStatus.COMPLETED);
  const allJobsDone = (po: PURCHASE_ORDER) => (po.jobs || []).length > 0 && !hasOpenJobs(po);
  const jobTabs = [
    { value: "ALL" as const, label: "All orders", count: searchedData.length },
    { value: "OPEN" as const, label: "Jobs still open", count: searchedData.filter(hasOpenJobs).length },
    { value: "DONE" as const, label: "All jobs done", count: searchedData.filter(allJobsDone).length },
  ];
  const visibleData =
    jobFilter === "OPEN" ? searchedData.filter(hasOpenJobs) : jobFilter === "DONE" ? searchedData.filter(allJobsDone) : searchedData;

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-4 pt-0 sm:p-6 sm:pt-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <PageTitleWithBreadcrumb title="Purchase Orders" breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]} />
          <p className="mt-1 text-sm text-[#4B5567]">Orders from customers, and the print jobs created for each one.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExportList && <ExportButton data={data} filename="purchase-orders" />}
          {canCreatePO && (
            <Button onClick={() => router.push("/purchase-order/create")} disabled={loading}>
              <PlusIcon /> New purchase order
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Show orders"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:rounded-lg sm:bg-[#EDF0F5] sm:p-1"
        >
          {jobTabs.map((tab) => {
            const active = jobFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() => setJobFilter(tab.value)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30",
                  active ? "bg-white text-[#14213D] shadow-sm" : "text-[#4B5567] hover:text-[#14213D]"
                )}
              >
                {tab.label}
                <span className="min-w-5 rounded bg-[#E4E8F0] px-1.5 text-xs font-semibold tabular-nums text-[#14213D]">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search PO number, customer, job or item"
              className="w-full bg-white pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal sm:w-[250px]", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd MMM yyyy")} - {format(date.to, "dd MMM yyyy")}
                    </>
                  ) : (
                    format(date.from, "dd MMM yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={7} label="Loading purchase orders" />
      ) : data.length === 0 ? (
        <EmptyState
          title="No Purchase Orders"
          description="You haven't received or created any purchase orders yet. Start by creating a NEW PO."
          createLabel={canCreatePO ? "Create New PO" : ""}
          createPath={canCreatePO ? "/purchase-order/create" : ""}
        />
      ) : visibleData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D9DFE8] bg-white px-6 py-10 text-center text-sm text-[#4B5567]">
          No purchase orders match these filters.{" "}
          <button
            type="button"
            className="font-semibold text-[#223F7A] underline underline-offset-2"
            onClick={() => {
              setSearch("");
              setJobFilter("ALL");
            }}
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <>
          <PurchaseOrderList
            orders={visibleData}
            canModify={canModifyPO}
            onDelete={handleDelete}
            onRefresh={fetchData}
          />
          <p className="text-sm text-[#4B5567]">
            Showing {visibleData.length} of {data.length} purchase {data.length === 1 ? "order" : "orders"}
          </p>
        </>
      )}
    </div>
  );
}

export default PurchaseOrderPage;
