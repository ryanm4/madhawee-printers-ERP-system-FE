import { IconFileInvoice, IconChartBar } from "@tabler/icons-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { KPIItem } from "@/modules/dashboard/types"
import { FileText } from "lucide-react"
import React from "react"

interface SectionCardsProps {
  data?: KPIItem[]
}

const KAR_CONFIG: Record<string, { label: string, icon: React.ElementType, description: string, isCurrency?: boolean }> = {
  totalQuotations: {
    label: "Total Quotations",
    icon: FileText,
    description: "Total quotations generated"
  },
  approvedQuotations: {
    label: "Approved Quotations",
    icon: IconFileInvoice,
    description: "Quotations approved by customers"
  },
  totalRevenue: {
    label: "Total Revenue",
    icon: IconChartBar,
    description: "Total revenue generated",
    isCurrency: true
  },
  avgQuoteValue: {
    label: "Avg. Quote Value",
    icon: IconChartBar,
    description: "Average value per quotation",
    isCurrency: true
  },
}

export function SectionCards({ data = [] }: SectionCardsProps) {
  if (!data?.length) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
        <p className="text-muted-foreground col-span-full">No insights available for the selected period.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {data
        .filter((item) => KAR_CONFIG[item.key])
        .map((item) => {
          const config = KAR_CONFIG[item.key]
          const Icon = config.icon

          const formattedValue = config.isCurrency
            ? `Rs. ${Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : Number(item.value).toLocaleString()

          return (
            <Card key={item.key} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>{config.label}</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums mt-2">
                      {formattedValue}
                    </CardTitle>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Icon className="size-7 text-primary" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {config.description}
                </div>
              </CardHeader>
            </Card>
          )
        })}
    </div>
  )
}
