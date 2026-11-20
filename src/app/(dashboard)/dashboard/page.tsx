"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getUser } from "@/lib/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Banknote,
  CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Package,
  PackagePlus,
  Plus,
  Truck,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { DashboardApi } from "@/modules/dashboard/api";
import { KPIItem, AnalyticsData } from "@/modules/dashboard/types";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/shared/loader";
import { TileWaves } from "./_components/tile-waves";
import { CurrencyCode, ProgressLine, Tile, TileHeader } from "./_components/tile";
import { RevenueTwelveMonths, TrendPoint, twelveMonthWindow } from "./_components/revenue-twelve-months";
import { OrdersWithoutJobs } from "./_components/orders-without-jobs";

const REMINDERS_PER_PAGE = 5;

const money = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const withSymbol = (currency: CurrencyCode, value: number) =>
  currency === "USD" ? `$ ${money(value)}` : `Rs. ${money(value)}`;

/** Revenue KPIs arrive per currency ({ LKR, USD }); older responses send one LKR number */
const byCurrency = (value: KPIItem["value"] | undefined): Record<CurrencyCode, number> => {
  if (value && typeof value === "object") {
    const v = value as unknown as Partial<Record<CurrencyCode, number>>;
    return { LKR: Number(v.LKR || 0), USD: Number(v.USD || 0) };
  }
  return { LKR: Number(value || 0), USD: 0 };
};

const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

function DashboardPage({
  user: initialUser,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  const { canCreateQuotation, canCreateJobTicket, canCreateGRN, canCreateDispatch } = usePermissions();
  // Shortcuts to start the most common records; each shows only if the user may create it
  const quickActions = [
    { href: "/quotation-management/create", label: "New quotation", icon: FileText, allowed: canCreateQuotation },
    { href: "/job-ticket/create", label: "New job ticket", icon: ClipboardList, allowed: canCreateJobTicket },
    { href: "/grn/create", label: "Receive goods", icon: PackagePlus, allowed: canCreateGRN },
    { href: "/dispatch-invoice/create", label: "New dispatch", icon: Truck, allowed: canCreateDispatch },
  ].filter((action) => action.allowed);  // starts loading: the page fetches as soon as it opens
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [kpiData, setKpiData] = useState<KPIItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stockReminderPage, setStockReminderPage] = useState(0);
  const [yearTrend, setYearTrend] = useState<TrendPoint[]>([]);
  const [yearTrendLoading, setYearTrendLoading] = useState(false);
  const [yearTrendFailed, setYearTrendFailed] = useState(false);
  const [yearCurrency, setYearCurrency] = useState<CurrencyCode>("LKR");

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email ?? "",
        avatar: "",
      });
    }
  }, []);

  const handleGenerateKPI = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const formData = {
        dateFrom: format(date?.from ?? new Date(), "yyyy-MM-dd 00:00:00"),
        dateTo: format(date?.to ?? new Date(), "yyyy-MM-dd 23:59:59"),
      };

      const response = await DashboardApi.create(formData);
      if (response && response.data) {
        setKpiData(response.data?.kpis || []);
        setAnalytics(response.data?.analytics || null);
        setStockReminderPage(0);
      }
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
      toast.error(getErrorMessage(error, "Failed to load dashboard data"));
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    handleGenerateKPI();
  }, [handleGenerateKPI]);

  // The 12 months ending with the selected period, whatever its length. Uses the same
  // dashboard endpoint and keeps only its monthly revenue figures.
  const yearEnd = date?.to ?? date?.from ?? new Date();
  const yearEndKey = format(yearEnd, "yyyy-MM");
  useEffect(() => {
    let cancelled = false;
    const [year, month] = yearEndKey.split("-").map(Number);
    const months = twelveMonthWindow(new Date(year, month - 1, 1));
    setYearTrendLoading(true);
    setYearTrendFailed(false);
    DashboardApi.create({
      dateFrom: format(months[0], "yyyy-MM-dd 00:00:00"),
      dateTo: format(endOfMonth(months[11]), "yyyy-MM-dd 23:59:59"),
    })
      .then((response) => {
        if (!cancelled) setYearTrend(response.data?.analytics?.revenueTrend ?? []);
      })
      .catch((error) => {
        console.error("12-month revenue fetch failed:", error);
        if (!cancelled) setYearTrendFailed(true);
      })
      .finally(() => {
        if (!cancelled) setYearTrendLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [yearEndKey]);

  const kpi = (key: string) => kpiData.find((k) => k.key === key)?.value;

  const totalQuotations = Number(kpi("totalQuotations") || 0);
  const approvedQuotations = Number(kpi("approvedQuotations") || 0);
  const revenue = byCurrency(kpi("totalRevenue"));
  const dispatchRevenue = byCurrency(kpi("dispatchRevenue"));
  const lowStockItems = Number(kpi("lowStockItems") || 0);

  const totalJobs = Number(analytics?.jobStats?.total_jobs || 0);
  const completedJobs = Number(analytics?.jobStats?.completed_jobs || 0);
  const efficiency = Number(analytics?.jobStats?.production_efficiency || 0);
  const totalDispatches = Number(analytics?.dispatchStats?.total_dispatches || 0);
  const completedDispatches = Number(analytics?.dispatchStats?.completed_dispatches || 0);

  const reminders = analytics?.stockReminders ?? [];
  const belowCount = reminders.filter((r) => r.stock_status === "BELOW").length;
  const nearCount = reminders.filter((r) => r.stock_status === "NEAR").length;
  const pageCount = Math.max(1, Math.ceil(reminders.length / REMINDERS_PER_PAGE));
  const pageStart = stockReminderPage * REMINDERS_PER_PAGE;
  const visibleReminders = reminders.slice(pageStart, pageStart + REMINDERS_PER_PAGE);

  const rangeLabel = date?.from
    ? date.to
      ? `${format(date.from, "d MMM yyyy")} to ${format(date.to, "d MMM yyyy")}`
      : format(date.from, "d MMM yyyy")
    : "Pick a date range";

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-6 bg-[#F6F7FA] p-4 sm:p-6 lg:p-8">
      {/* Greeting and period */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageTitleWithBreadcrumb isDashboard={true} userName={user?.name} />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "h-10 w-full justify-start gap-2 rounded-xl border-[#E4E8F0] bg-white text-left font-normal sm:w-auto",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="size-4 text-[#5B6474]" />
              <span className="text-[#5B6474]">Showing</span>
              <span className="font-medium text-[#1B2433] tabular-nums">{rangeLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              onSelect={(range) => {
                if (
                  range?.from &&
                  range?.to &&
                  range.from.getTime() === range.to.getTime()
                ) {
                  setDate({ from: range.from, to: undefined });
                } else {
                  setDate(range);
                }
              }}
              selected={date}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12 lg:gap-5">
          {/* Welcome: the one bold tile */}
          <section className="relative overflow-hidden rounded-2xl bg-[#1F242D] p-7 text-white md:col-span-6 lg:col-span-7 lg:row-span-2 lg:p-9">
            <TileWaves className="pointer-events-none absolute inset-0" />
            <div className="relative flex h-full flex-col">
              <h2 className="text-3xl font-bold leading-tight tracking-tight lg:text-[2.5rem]">
                Welcome back, {user?.name}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                You have{" "}
                <span className="font-semibold text-white">{totalQuotations}</span>{" "}
                {totalQuotations === 1 ? "quotation" : "quotations"} in this period
                to review.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-10 rounded-xl bg-white px-5 font-semibold text-[#223F7A] hover:bg-white/90"
                >
                  <Link href="/job-ticket">View jobs</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-xl border-white/40 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/quotation-management">Quotations</Link>
                </Button>
              </div>

              {quickActions.length > 0 && (
                <nav aria-label="Quick actions" className="mt-8 border-t border-white/15 pt-5 lg:mt-auto">
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {quickActions.map(({ href, label, icon: Icon }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#223F7A]">
                            <Icon className="size-4" aria-hidden />
                          </span>
                          {label}
                          <Plus className="ml-auto size-4 text-white/60 transition-colors group-hover:text-white" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </section>

          {/* Revenue */}
          <Tile className="md:col-span-3 lg:col-span-5">
            <TileHeader icon={Banknote} title="Revenue" />
            <div className="mt-5 flex flex-col gap-3">
              <div>
                <p className="text-[13px] text-[#5B6474]">Total revenue (LKR)</p>
                <p className="mt-1 whitespace-nowrap text-[1.75rem] font-bold leading-tight tracking-tight text-[#1B2433] tabular-nums">
                  {withSymbol("LKR", revenue.LKR)}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-[#5B6474]">Total revenue (USD)</p>
                <p className="mt-1 whitespace-nowrap text-xl font-bold tracking-tight text-[#1B2433] tabular-nums">
                  {withSymbol("USD", revenue.USD)}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EEF1F6] pt-4">
              {(["LKR", "USD"] as const).map((code) => (
                <div key={code}>
                  <p className="flex items-center gap-1.5 text-[13px] text-[#5B6474]">
                    <Truck className="size-3.5" aria-hidden />
                    Dispatch revenue ({code})
                  </p>
                  <p className="mt-1 whitespace-nowrap text-base font-semibold text-[#1B2433] tabular-nums">
                    {withSymbol(code, dispatchRevenue[code])}
                  </p>
                </div>
              ))}
            </div>
          </Tile>

          {/* Quotations */}
          <Tile className="md:col-span-3 lg:col-span-5">
            <TileHeader
              icon={FileText}
              title="Quotations"
              href="/quotation-management"
              linkLabel="Open quotations"
            />
            <div className="mt-5 flex items-end gap-8">
              <div>
                <p className="text-[13px] text-[#5B6474]">Total quotations</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-[#1B2433] tabular-nums">
                  {totalQuotations.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-[#5B6474]">Approved</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-[#16A34A] tabular-nums">
                  {approvedQuotations.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <ProgressLine
                tone="green"
                value={percent(approvedQuotations, totalQuotations)}
                label={`${Math.round(percent(approvedQuotations, totalQuotations))}% of quotations approved`}
              />
            </div>
          </Tile>

          {/* Production */}
          <Tile className="md:col-span-2 lg:col-span-4">
            <TileHeader icon={ClipboardList} title="Production" href="/job-ticket" linkLabel="Jobs" />
            <div className="mt-5 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-[#1B2433] tabular-nums">
                {totalJobs.toLocaleString()}
              </p>
              <p className="text-sm text-[#5B6474]">active jobs</p>
            </div>
            <div className="mt-auto flex flex-col gap-4 pt-5">
              <ProgressLine
                value={efficiency}
                label={`Production efficiency ${efficiency.toFixed(2)}%`}
              />
              <p className="text-[13px] text-[#5B6474]">
                {completedJobs.toLocaleString()} of {totalJobs.toLocaleString()} jobs completed
              </p>
            </div>
          </Tile>

          {/* Dispatch */}
          <Tile className="md:col-span-2 lg:col-span-4">
            <TileHeader icon={Truck} title="Dispatch" href="/dispatch-invoice" linkLabel="Dispatches" />
            <div className="mt-5 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-[#1B2433] tabular-nums">
                {totalDispatches.toLocaleString()}
              </p>
              <p className="text-sm text-[#5B6474]">dispatches</p>
            </div>
            <div className="mt-auto pt-5">
              <ProgressLine
                value={percent(completedDispatches, totalDispatches)}
                label={`${completedDispatches.toLocaleString()} of ${totalDispatches.toLocaleString()} completed (${Math.round(
                  percent(completedDispatches, totalDispatches)
                )}%)`}
              />
            </div>
          </Tile>

          {/* Stock */}
          <Tile className="md:col-span-2 lg:col-span-4">
            <TileHeader icon={Package} title="Stock" href="/inventory" linkLabel="Stock list" />
            <div className="mt-5 flex items-baseline gap-2">
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight tabular-nums",
                  lowStockItems > 0 ? "text-[#DC2626]" : "text-[#1B2433]"
                )}
              >
                {lowStockItems.toLocaleString()}
              </p>
              <p className="text-sm text-[#5B6474]">low stock items</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[13px] font-medium text-[#B91C1C]">
                <span className="size-1.5 rounded-full bg-[#DC2626]" aria-hidden />
                {belowCount} below reorder level
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-[13px] font-medium text-[#B45309]">
                <span className="size-1.5 rounded-full bg-[#D97706]" aria-hidden />
                {nearCount} nearing reorder level
              </span>
            </div>
          </Tile>

          {/* Open purchase orders nobody has made a job ticket for yet */}
          <OrdersWithoutJobs className="md:col-span-6 lg:col-span-12" canCreateJob={canCreateJobTicket} />

          {/* Revenue trend: always the last 12 months, so a short period still shows a trend */}
          <RevenueTwelveMonths
            className="md:col-span-6 lg:col-span-7"
            data={yearTrend}
            end={yearEnd}
            currency={yearCurrency}
            onCurrencyChange={setYearCurrency}
            isLoading={yearTrendLoading}
            failed={yearTrendFailed}
          />

          {/* Stock reminders */}
          <Tile className="md:col-span-6 lg:col-span-5">
            <TileHeader icon={AlertTriangle} title="Stock reminders">
              {reminders.length > REMINDERS_PER_PAGE && (
                <div className="flex items-center gap-1">
                  <span className="mr-1 text-xs text-[#5B6474] tabular-nums">
                    {pageStart + 1}–{Math.min(pageStart + REMINDERS_PER_PAGE, reminders.length)} of{" "}
                    {reminders.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-lg border-[#E4E8F0]"
                    aria-label="Previous reminders"
                    onClick={() => setStockReminderPage((p) => Math.max(0, p - 1))}
                    disabled={stockReminderPage === 0}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-lg border-[#E4E8F0]"
                    aria-label="Next reminders"
                    onClick={() => setStockReminderPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={stockReminderPage >= pageCount - 1}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </TileHeader>

            {reminders.length > 0 ? (
              <ul className="mt-4 divide-y divide-[#EEF1F6]">
                {visibleReminders.map((reminder, idx) => {
                  const isBelow = reminder.stock_status === "BELOW";
                  const name = [reminder.item_sub_category, reminder.item_name]
                    .filter(Boolean)
                    .join(" ");
                  const qty = Number(reminder.available_qty || reminder.quantity || 0);
                  return (
                    <li key={`${pageStart + idx}-${reminder.item_name}`} className="flex items-center gap-3 py-3">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          isBelow ? "bg-[#DC2626]" : "bg-[#D97706]"
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1B2433]">
                          {name}
                          {reminder.size && (
                            <span className="font-normal text-[#5B6474]"> ({reminder.size})</span>
                          )}
                        </p>
                        <p className={cn("text-xs", isBelow ? "text-[#B91C1C]" : "text-[#B45309]")}>
                          {isBelow ? "Below reorder level" : "Nearing reorder level"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#1B2433] tabular-nums">
                          {qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-[#5B6474]">available</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                <CheckCircle2 className="size-8 text-[#16A34A]/70" aria-hidden />
                <p className="text-sm font-medium text-[#1B2433]">Inventory levels are optimal.</p>
                <p className="text-[13px] text-[#5B6474]">No item is near its reorder level.</p>
              </div>
            )}
          </Tile>
        </div>
      )}
    </div>
  );
}

/** Placeholder tiles in the same layout, so the page doesn't jump when data arrives */
/** Grey placeholder line, firmer than the default skeleton so it reads on white tiles */
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <Skeleton className={cn("bg-[#E3E8EF]", className)} style={style} />;
}

/** An empty tile: header line, a big figure and a few rows, shaped like the real tiles */
function TileSkeleton({ className, rows = 2, tall = false }: { className?: string; rows?: number; tall?: boolean }) {
  return (
    <div className={cn("flex flex-col rounded-2xl border border-[#E4E8F0] bg-white p-6", className)}>
      <div className="flex items-center gap-2.5">
        <Bone className="size-8 rounded-lg" />
        <Bone className="h-4 w-28" />
      </div>
      <Bone className={cn("mt-6 w-40", tall ? "h-9" : "h-7")} />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: rows }, (_, i) => (
          <Bone key={i} className="h-3.5" />
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12 lg:gap-5"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Welcome tile keeps its navy so the page doesn't flash white, with the press loader in it */}
      <div className="flex min-h-[280px] flex-col justify-between rounded-2xl bg-[#1F242D] p-7 md:col-span-6 lg:col-span-7 lg:row-span-2 lg:p-9">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-72 max-w-full bg-white/15" />
          <Skeleton className="h-4 w-64 max-w-full bg-white/10" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-10 w-28 rounded-lg bg-white/20" />
            <Skeleton className="h-10 w-28 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-4 self-end">
          <span className="text-sm text-white/70">Loading your figures</span>
          <div className="rounded-lg bg-white p-2.5">
            <Loader size={36} label="Loading dashboard" />
          </div>
        </div>
      </div>
      <TileSkeleton className="md:col-span-3 lg:col-span-5" rows={3} tall />
      <TileSkeleton className="md:col-span-3 lg:col-span-5" rows={2} />
      <TileSkeleton className="md:col-span-2 lg:col-span-4" />
      <TileSkeleton className="md:col-span-2 lg:col-span-4" />
      <TileSkeleton className="md:col-span-2 lg:col-span-4" />
      <div className="flex flex-col rounded-2xl border border-[#E4E8F0] bg-white p-6 md:col-span-6 lg:col-span-7">
        <div className="flex items-center gap-2.5">
          <Bone className="size-8 rounded-lg" />
          <Bone className="h-4 w-32" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Bone className="h-12 rounded-xl" />
          <Bone className="h-12 rounded-xl" />
          <Bone className="h-12 rounded-xl" />
        </div>
        {/* A faint chart outline instead of a solid block */}
        <div className="mt-6 flex h-[200px] items-end gap-2">
          {[38, 52, 45, 60, 48, 70, 64, 58, 75, 68, 82, 76].map((h, i) => (
            <Bone key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <TileSkeleton className="md:col-span-6 lg:col-span-5" rows={5} />
    </div>
  );
}

export default DashboardPage;
