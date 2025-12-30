import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import React from 'react'

interface PageTitleWithBreadcrumbProps {
    title?: string
    breadcrumbs?: { title: string; href: string }[]
    isDashboard?: boolean
    userName?: string
}

function PageTitleWithBreadcrumb({
    title,
    breadcrumbs = [],
    isDashboard = false,
    userName = "John Doe"
}: PageTitleWithBreadcrumbProps) {

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 18) return "Good Afternoon"
        return "Good Evening"
    }

    const formatDate = () => {
        const date = new Date()
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (isDashboard) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Dashboard</span>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {getGreeting()}, {userName}
                </h1>
                <p className="text-sm text-muted-foreground">{formatDate()}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.href}>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href={crumb.href}>
                                    {crumb.title}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                        </React.Fragment>
                    ))}
                    <BreadcrumbItem>
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
    )
}

export default PageTitleWithBreadcrumb