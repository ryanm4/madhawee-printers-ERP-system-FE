"use client";
import React, { useEffect, useState } from "react";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getUser } from "@/lib/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { DashboardApi } from "@/modules/dashboard/api";
import { SectionCards } from "@/components/section-cards";
import { KPIItem, AnalyticsData } from "@/modules/dashboard/types";
import { ChartRadialShape } from "@/components/chart-radial-shape";
import { RevenueTrendChart } from "@/components/revenue-trend-chart";
import { InsightsCard } from "@/components/insights-card";
import { AdditionalKPIs } from "@/components/additional-kpis";

function DashboardPage({
  user: initialUser,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {

  const [user, setUser] = useState<{ name: string; email: string; avatar: string }>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })
  const [kpiData, setKpiData] = useState<KPIItem[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const userData = getUser()
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email,
        avatar: "", // GET_ALL_USER doesn't have avatar
      })
    }
  }, [])

  const handleGenerateKPI = async () => {
    setIsLoading(true);
    try {
      const formData = {
        dateFrom: date?.from ?? new Date(),
        dateTo: date?.to ?? new Date(),
      }

      const response = await DashboardApi.create(formData)
      if (response && response.data) {

        setKpiData(response.data?.kpis || [])
        setInsights(response.data?.insights || [])
        setAnalytics(response.data?.analytics || null)
      }
    } catch (error) {

      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }

  }


  useEffect(() => {
    handleGenerateKPI()
  }, [date])

  return (
    <>

      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <div className="flex flex-row items-center justify-between">
          <PageTitleWithBreadcrumb isDashboard={true} userName={user?.name} />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[300px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar

                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center justify-end space-x-2">

        </div>
        <div className="flex flex-col gap-4 md:gap-6 md:py-6">
          <SectionCards data={kpiData} />

        </div>
        {analytics?.revenueTrend && analytics.revenueTrend.length > 0 && (
          <div >
            <RevenueTrendChart data={analytics.revenueTrend} />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 ">
          <ChartRadialShape
            title="Dispatch Status"
            description="Total vs Completed Dispatches"
            total={Number(analytics?.dispatchStats?.total_dispatches || 0)}
            completed={Number(analytics?.dispatchStats?.completed_dispatches || 0)}
            label="Dispatches"
            color="#223F7A"
            footerTitle="Dispatch Efficiency"
            footerDescription={`Completed: ${analytics?.dispatchStats?.completed_dispatches || 0} / Total: ${analytics?.dispatchStats?.total_dispatches || 0}`}
          />
          <ChartRadialShape
            title="Job Status"
            description="Total vs Completed Jobs"
            total={Number(analytics?.jobStats?.total_jobs || 0)}
            completed={Number(analytics?.jobStats?.completed_jobs || 0)}
            label="Jobs"
            color="#223F7A"
            footerTitle="Production Efficiency"
            footerDescription={`Completed: ${analytics?.jobStats?.completed_jobs || 0} / Total: ${analytics?.jobStats?.total_jobs || 0}`}
          />
        </div>

        {/* Revenue Trend Chart */}


        {/* Additional KPIs and Insights Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Additional KPIs - Left column */}
          <AdditionalKPIs
            productionEfficiency={analytics?.jobStats?.production_efficiency || "0.00"}
            lowStockItems={kpiData.find(item => item.key === "lowStockItems")?.value || 0}
            totalDispatches={analytics?.dispatchStats?.total_dispatches || 0}
          />

          {/* Insights Card - Right column */}
          {insights && insights.length > 0 && (
            <InsightsCard insights={insights} />
          )}
        </div>

        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </>
  );
}

export default DashboardPage;
