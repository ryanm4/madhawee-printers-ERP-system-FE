"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";
import { Info, TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyCode, CurrencyToggle, Tile, TileHeader } from "./tile";

export interface TrendPoint {
  month: string;
  revenue: string | number;
  currency?: string;
}

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const amount = (currency: CurrencyCode, value: number) =>
  `${currency === "USD" ? "$" : "Rs."} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** The 12 calendar months ending with the month that contains `end` */
export const twelveMonthWindow = (end: Date) => {
  const last = startOfMonth(end);
  return Array.from({ length: 12 }, (_, i) => subMonths(last, 11 - i));
};

interface RevenueTwelveMonthsProps {
  /** Monthly totals per currency for the 12-month window, from the dashboard endpoint */
  data: TrendPoint[];
  /** Last day of the selected period; the window ends with this month */
  end: Date;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  isLoading: boolean;
  /** The 12-month request failed; say so rather than showing zeros */
  failed: boolean;
  className?: string;
}

/**
 * The dashboard's revenue trend: revenue for each of the 12 months ending with the selected
 * period, so even a one-month selection shows a real trend. Months with no purchase orders
 * are drawn as zero instead of being left out, so gaps show as gaps.
 */
export function RevenueTwelveMonths({
  data,
  end,
  currency,
  onCurrencyChange,
  isLoading,
  failed,
  className,
}: RevenueTwelveMonthsProps) {
  const months = twelveMonthWindow(end);
  const totals = new Map(
    data
      .filter((p) => p.currency === currency)
      .map((p) => [String(p.month).slice(0, 7), Number(p.revenue) || 0])
  );
  const points = months.map((m) => ({
    key: format(m, "yyyy-MM"),
    label: format(m, "MMM"),
    fullLabel: format(m, "MMMM yyyy"),
    revenue: totals.get(format(m, "yyyy-MM")) ?? 0,
  }));

  const total = points.reduce((sum, p) => sum + p.revenue, 0);
  const best = points.reduce((a, b) => (b.revenue > a.revenue ? b : a), points[0]);
  const current = points[points.length - 1];
  const previous = points[points.length - 2];
  const change =
    previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : null;

  const chartConfig = {
    revenue: { label: "Revenue", color: "#223F7A" },
  } satisfies ChartConfig;

  return (
    <Tile className={className}>
      <TileHeader icon={TrendingUp} title="Revenue trend">
        <CurrencyToggle value={currency} onChange={onCurrencyChange} label="Chart currency" />
      </TileHeader>
      <p className="mt-1 pl-[42px] text-[13px] text-[#5B6474]">
        Last 12 months, {format(months[0], "MMM yyyy")} to {format(months[11], "MMM yyyy")}, by purchase
        order date
      </p>

      {failed ? (
        <p className="mt-5 flex h-[200px] items-center justify-center gap-2 text-sm text-[#5B6474]">
          <Info className="size-4" aria-hidden />
          Couldn&apos;t load the last 12 months of revenue. Refresh the page to try again.
        </p>
      ) : isLoading ? (
        <div className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-[13px] text-[#5B6474]">12-month total</dt>
              <dd className="mt-1 text-lg font-bold tracking-tight text-[#1B2433] tabular-nums">
                {amount(currency, total)}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-[#5B6474]">Best month</dt>
              <dd className="mt-1 text-lg font-bold tracking-tight text-[#1B2433] tabular-nums">
                {best.revenue > 0 ? best.fullLabel : "None yet"}
              </dd>
              {best.revenue > 0 && (
                <p className="text-[13px] text-[#5B6474] tabular-nums">{amount(currency, best.revenue)}</p>
              )}
            </div>
            <div>
              <dt className="text-[13px] text-[#5B6474]">
                {current.label} vs {previous.label}
              </dt>
              <dd
                className={
                  "mt-1 text-lg font-bold tracking-tight tabular-nums " +
                  (change === null ? "text-[#1B2433]" : change >= 0 ? "text-[#16A34A]" : "text-[#DC2626]")
                }
              >
                {change === null
                  ? "No revenue last month"
                  : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
              </dd>
            </div>
          </dl>

          <div className="mt-5 h-[240px]">
            {total > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={points} margin={{ left: 4, right: 12, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenue12Fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#223F7A" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#223F7A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeOpacity={0.1} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={compact}
                    className="text-xs"
                  />
                  <ChartTooltip
                    cursor={{ stroke: "#223F7A", strokeOpacity: 0.2 }}
                    content={({ active, payload }) => {
                      const point = payload?.[0]?.payload as (typeof points)[number] | undefined;
                      if (!active || !point) return null;
                      return (
                        <div className="rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-xs shadow-sm">
                          <p className="text-[#5B6474]">{point.fullLabel}</p>
                          <p className="mt-0.5 font-semibold text-[#1B2433] tabular-nums">
                            {amount(currency, point.revenue)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#223F7A"
                    strokeWidth={2}
                    fill="url(#revenue12Fill)"
                    dot={{ r: 3, fill: "#223F7A", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="flex h-full items-center justify-center gap-2 text-sm text-[#5B6474]">
                <Info className="size-4" aria-hidden />
                No {currency} revenue in the last 12 months.
              </p>
            )}
          </div>
        </>
      )}
    </Tile>
  );
}
