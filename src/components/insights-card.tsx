import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsightsCardProps {
    insights: string[];
    className?: string;
}

const getInsightIcon = (insight: string) => {
    const lowerInsight = insight.toLowerCase()
    if (lowerInsight.includes('high') || lowerInsight.includes('pending')) {
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
    if (lowerInsight.includes('healthy') || lowerInsight.includes('good')) {
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (lowerInsight.includes('below') || lowerInsight.includes('low')) {
        return <TrendingDown className="h-5 w-5 text-red-500" />
    }
    return <AlertCircle className="h-5 w-5 text-blue-500" />
}

export function InsightsCard({ insights, className }: InsightsCardProps) {
    return (
        <Card className={cn("h-full", className)}>
            <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important observations from your data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {getInsightIcon(insight)}
                            </div>
                            <p className="text-sm text-muted-foreground">{insight}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
