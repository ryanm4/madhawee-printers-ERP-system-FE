"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface RevenueTrendChartProps {
    data: Array<{ month: string; revenue: string | number }>;
}

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "#223F7A",
    },
} satisfies ChartConfig

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const chartData = data.map(item => ({
        month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Number(item.revenue)
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue overview</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={chartData} barSize={60}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Revenue performance <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing revenue for the selected period
                </div>
            </CardFooter>
        </Card>
    )
}
