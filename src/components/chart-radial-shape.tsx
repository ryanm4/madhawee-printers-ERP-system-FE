"use client"

import { cn } from "@/lib/utils"
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
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const data = [{ name: label, value: percentage, fill: color }];

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
        <Card className="flex flex-col border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all h-full">
            <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-400">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col justify-center">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[200px]"
                >
                    <RadialBarChart
                        data={data}
                        startAngle={180}
                        endAngle={-180}
                        innerRadius="75%"
                        outerRadius="100%"
                        barSize={15}
                    >
                        <RadialBar
                            dataKey="value"
                            background={{ fill: '#f3f4f6' }}
                            cornerRadius={30}
                        />
                        <PolarRadiusAxis 
                           type="number" 
                           domain={[0, 100]} 
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
                                                    className="fill-gray-900 text-5xl font-black tracking-tighter"
                                                >
                                                    {total}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 25}
                                                    className="fill-gray-400 text-sm font-bold uppercase tracking-widest"
                                                >
                                                  {label}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex-col gap-1 items-start">
                <div className="flex items-center gap-2 leading-none font-bold text-gray-700">
                    {footerTitle} <TrendingUp className={cn("h-4 w-4", percentage > 80 ? "text-green-500" : "text-gray-400")} />
                </div>
                <div className="text-gray-400 text-xs font-medium">
                    {footerDescription}
                </div>
            </CardFooter>
        </Card>
    )
}
