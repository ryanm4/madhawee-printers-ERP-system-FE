"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface RevenueTrendChartProps {
    data: Array<{ month: string; revenue: string | number }>;
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const chartData = data.map(item => ({
        month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Number(item.revenue)
    }))

    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "#2563eb",
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeOpacity={0.1} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="text-gray-400 text-xs font-bold"
                />
                <ChartTooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 12 }}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#2563eb" 
                  radius={12} 
                  className="transition-all hover:opacity-80"
                />
            </BarChart>
        </ChartContainer>
    )
}
