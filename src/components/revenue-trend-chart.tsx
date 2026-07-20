"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
            color: "#223F7A",
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
            >
                <CartesianGrid vertical={false} strokeOpacity={0.1} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="text-gray-400 text-xs font-bold"
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-gray-400 text-xs font-bold"
                />
                <ChartTooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                    dataKey="revenue"
                    fill="#223F7A"
                    radius={[8, 8, 0, 0]}
                    className="transition-all hover:opacity-85"
                />
            </BarChart>
        </ChartContainer>
    )
}
