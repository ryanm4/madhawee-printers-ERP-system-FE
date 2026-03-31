import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconChartBar, IconPackage } from "@tabler/icons-react"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdditionalKPIsProps {
    productionEfficiency: string | number;
    lowStockItems: string | number;
    totalDispatches: string | number;
    className?: string;
}

export function AdditionalKPIs({ productionEfficiency, lowStockItems, totalDispatches, className }: AdditionalKPIsProps) {
    const kpis = [
        {
            key: "productionEfficiency",
            label: "Production Efficiency",
            value: productionEfficiency,
            icon: IconChartBar,
            description: "Efficiency score"
        },
        {
            key: "lowStockItems",
            label: "Low Stock Items",
            value: lowStockItems,
            icon: IconPackage,
            description: "Items below reorder level"
        },
        {
            key: "totalDispatches",
            label: "Total Dispatches",
            value: totalDispatches,
            icon: Truck,
            description: "Total items dispatched"
        }
    ]

    return (
        <div className={cn("grid grid-rows gap-4 md:grid-rows-3", className)}>
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                    <Card key={kpi.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.label}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {kpi.description}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
