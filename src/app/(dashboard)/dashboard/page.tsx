"use client";
import React, { useEffect, useState } from "react";
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
import { CalendarIcon, TrendingUp, Package, Truck, ClipboardList, CheckCircle2, AlertCircle, Clock, FileText, Banknote, BarChart3, LucideIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { DashboardApi } from "@/modules/dashboard/api";
import { KPIItem, AnalyticsData } from "@/modules/dashboard/types";
import { PageLoader } from "@/components/shared/loader";
import { Card } from "@/components/ui/card";

import { ChartRadialShape } from "@/components/chart-radial-shape";
import { AdditionalKPIs } from "@/components/additional-kpis";
import { InsightsCard } from "@/components/insights-card";

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
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [kpiData, setKpiData] = useState<KPIItem[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email,
        avatar: "",
      });
    }
  }, []);

  const handleGenerateKPI = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const formData = {
        dateFrom: date?.from ?? new Date(),
        dateTo: date?.to ?? new Date(),
      };

      const response = await DashboardApi.create(formData);
      if (response && response.data) {
        setKpiData(response.data?.kpis || []);
        setInsights(response.data?.insights || []);
        setAnalytics(response.data?.analytics || null);
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

  const KAR_CONFIG: Record<string, { label: string, color: string, badgeBg: string, icon: LucideIcon }> = {
    totalRevenue: { label: "Total Revenue", color: "#8b5cf6", badgeBg: "#8b5cf615", icon: Banknote },
    avgQuoteValue: { label: "Total dispatched revenue", color: "#f59e0b", badgeBg: "#f59e0b15", icon: BarChart3 },
    totalQuotations: { label: "Total Quotations", color: "#223F7A", badgeBg: "#223F7A15", icon: FileText },
    approvedQuotations: { label: "Approved Quotations", color: "#10b981", badgeBg: "#10b98115", icon: CheckCircle2 },

  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 min-h-screen bg-[#FDFDFF]">
      {/* Header with Breadcrumbs and Date Picker */}
      <div className="flex flex-row items-center justify-between mb-2">
        <PageTitleWithBreadcrumb isDashboard={true} userName={user?.name} />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal sm:w-[300px] rounded-2xl h-11 border-gray-100 shadow-sm",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              onSelect={(range) => {
                if (range?.from && range?.to && range.from.getTime() === range.to.getTime()) {
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
        <div className="flex-1 flex items-center justify-center">
          <PageLoader />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Top Row: Full-width Hero with KPIs inside */}
          <Card className="md:col-span-12 border-none shadow-sm rounded-[2rem] overflow-hidden relative group bg-white">
            {/* Gradient Ring — centered at top, half visible */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-56 w-[400px] h-[400px] group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'conic-gradient(from 160deg, #223F7A, #3b5998, #4a7cc9, #223F7A, #1a3060, #223F7A)',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 40px), #000 calc(100% - 40px))',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 40px), #000 calc(100% - 40px))',
                }}
              />
              <div
                className="absolute inset-0 rounded-full opacity-10 blur-3xl -z-10"
                style={{
                  background: 'conic-gradient(from 160deg, #223F7A, #4a7cc9, #223F7A)',
                }}
              />
            </div>

            {/* Content Grid: Welcome left, KPIs right */}
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch">
              {/* Left: Welcome */}
              <div className="flex-1 px-10 pb-8 pt-6 flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                  Welcome Back,<br />{user?.name}!
                </h2>
                <p className="text-gray-500 text-lg max-w-md mb-6 leading-relaxed">
                  Ready to manage your printing operations? You have <span className="font-bold" style={{ color: '#223F7A' }}>{kpiData.find(k => k.key === "totalQuotations")?.value || 0}</span> active quotations to review.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => window.location.href = '/job-ticket'} className="w-fit rounded-2xl h-12 px-6 text-white font-bold border-none shadow-lg transition-all duration-300 hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #223F7A, #3b5998)' }}>
                    View Jobs
                  </Button>
                  <Button onClick={() => window.location.href = '/quotation-management'} variant="outline" className="w-fit rounded-2xl h-12 px-6 text-gray-700 hover:text-white font-bold transition-all duration-300" style={{ borderColor: '#223F7A' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#223F7A'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                    Quotations
                  </Button>
                </div>
              </div>

              {/* Right: KPI Grid */}
              <div className="lg:w-[480px] xl:w-[540px] p-6 lg:p-10 flex items-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  {Object.keys(KAR_CONFIG).map((key) => {
                    const item = kpiData.find(d => d.key === key)
                    if (!item) return null

                    const config = KAR_CONFIG[key]
                    const isCurrency = key === 'totalRevenue' || key === 'avgQuoteValue'
                    const rawValue = Number(item.value)

                      // Smart formatting: abbreviate large numbers to prevent clutter
                      const formatValue = (val: number, currency: boolean) => {
                        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`
                        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
                        // For non-currency large counts, keep them full until very large
                        if (!currency && val < 100000) return val.toLocaleString()
                        if (val >= 10000) return `${(val / 1000).toFixed(1)}K`
                        return val.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      }

                      const formattedValue = isCurrency
                        ? `Rs. ${formatValue(rawValue, true)}`
                        : formatValue(rawValue, false)

                      const Icon = config.icon || TrendingUp

                      // Dynamic font sizing based on length to prevent layout breaks
                      const getFontSize = () => {
                        const len = formattedValue.length
                        if (isCurrency) {
                          if (len > 12) return "text-xl"
                          if (len > 8) return "text-2xl"
                          return "text-3xl"
                        } else {
                          if (len > 5) return "text-4xl"
                          return "text-6xl"
                        }
                      }

                      return (
                        <div key={item.key} className="bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-xl hover:border-gray-200 transition-all group/kpi min-h-[160px] flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{config.label}</p>
                            <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover/kpi:scale-110 transition-transform" style={{ backgroundColor: config.badgeBg }}>
                              <Icon className="w-5 h-5" style={{ color: config.color }} />
                            </div>
                          </div>
                          <div>
                            <h3 className={cn("font-black tracking-tighter text-gray-900 leading-none truncate", getFontSize())}>
                              {formattedValue}
                            </h3>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Quick Stats Footer */}
            <div className="relative z-10 border-t border-gray-100 px-10 py-4 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#223F7A]" />
                <span className="text-sm font-bold text-gray-900">{analytics?.jobStats?.total_jobs || 0}</span>
                <span className="text-xs text-gray-400">Active Jobs</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#223F7A]" />
                <span className="text-sm font-bold text-gray-900">{analytics?.dispatchStats?.total_dispatches || 0}</span>
                <span className="text-xs text-gray-400">Dispatches</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#223F7A]" />
                <span className="text-sm font-bold text-gray-900">{kpiData.find(k => k.key === "lowStockItems")?.value || 0}</span>
                <span className="text-xs text-gray-400">Low Stock</span>
              </div>
            </div>
          </Card>

          {/* Middle Row: Efficiency Status Indicators (PROMINENT) */}
          <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartRadialShape
              title="Dispatch Track"
              description="Status of current deliveries"
              total={Number(analytics?.dispatchStats?.total_dispatches || 0)}
              completed={Number(analytics?.dispatchStats?.completed_dispatches || 0)}
              label="Dispatch"
              color="#6366f1"
              footerTitle="Speed Score"
              footerDescription="Real-time dispatch fulfillment"
            />
            <ChartRadialShape
              title="Production Flow"
              description="Current manufacturing cycle"
              total={Number(analytics?.jobStats?.total_jobs || 0)}
              completed={Number(analytics?.jobStats?.completed_jobs || 0)}
              label="Jobs"
              color="#10b981"
              footerTitle="Output Rate"
              footerDescription="Active job ticket progress"
              percentage={Number(analytics?.jobStats?.production_efficiency || 0)}
            />
            <div className="lg:col-span-1 flex flex-col h-full">
              {insights && insights.length > 0 ? (
                <InsightsCard insights={insights} className="h-full border-none shadow-sm rounded-[2rem] p-8" />
              ) : (
                <Card className="h-full border-none shadow-sm rounded-[2rem] p-8 bg-white flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 leading-tight">System Healthy</h4>
                  <p className="text-sm text-gray-400">All modules are operating normally.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Bottom Row: Alerts and Stock Summary */}
          <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-[2rem] bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Operational Log</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  LIVE UPDATES
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Low Stock: Gloss Finish", value: "8 items", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", desc: "Inventory requires attention" },
                  { title: "Pending Approval", value: "12 Quotes", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", desc: "Waiting for customer feedback" },
                  { title: "In Printing", value: "240 Units", icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Currently on production floor" },
                  { title: "Scheduled Dispatch", value: "4 Today", icon: Truck, color: "text-green-600", bg: "bg-green-50", desc: "Logistics ready for pickup" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 rounded-3xl border border-gray-50 hover:border-gray-100 hover:bg-gray-50/50 transition-all cursor-pointer">
                    <div className={cn("p-3 rounded-2xl", row.bg, row.color)}>
                      <row.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{row.title}</p>
                      <p className="text-lg font-black text-gray-900">{row.value}</p>
                      <p className="text-[10px] text-gray-400">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <AdditionalKPIs
              productionEfficiency={analytics?.jobStats?.production_efficiency || "0.00"}
              lowStockItems={kpiData.find((item) => item.key === "lowStockItems")?.value || 0}
              totalDispatches={analytics?.dispatchStats?.total_dispatches || 0}
              className="border-none shadow-sm rounded-[2rem] p-8 bg-white lg:col-span-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
