"use client"

import { TrendingUp } from "lucide-react"
import {
    Label,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "A radial chart with a custom shape"

interface ChartRadialShapeProps {
    title: string;
    description: string;
    total: number;
    completed: number;
    label: string;
    color?: string;
    footerTitle: string;
    footerDescription: string;
}

export function ChartRadialShape({
    title,
    description,
    total,
    completed,
    label,
    color = "var(--chart-1)",
    footerTitle,
    footerDescription
}: ChartRadialShapeProps) {

    const chartData = [
        { name: label, value: completed, fill: color },
    ]

    // Calculate the end angle based on completion percentage
    // Start at 90 degrees, and add up to 360 degrees based on completion
    const completionPercentage = total > 0 ? (completed / total) : 0;
    const endAngle = 90 + (360 * completionPercentage);

    const chartConfig = {
        value: {
            label: label,
        },
        [label.toLowerCase()]: {
            label: label,
            color: color,
        },
    } satisfies ChartConfig

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={90}
                        endAngle={endAngle}
                        innerRadius={80}
                        outerRadius={140}
                    >
                        {/* Setting domain to [0, total] ensures the bar fills proportionally */}
                        <PolarRadiusAxis
                            type="number"
                            domain={[0, total || 1]}
                            tick={false}
                            tickLine={false}
                            axisLine={false}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-4xl font-bold"
                                                >
                                                    {total.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {label}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>

                        <RadialBar
                            dataKey="value"
                            background
                            cornerRadius={10}
                        />

                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    {footerTitle} <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    {footerDescription}
                </div>
            </CardFooter>
        </Card>
    )
}
