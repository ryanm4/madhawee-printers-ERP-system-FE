"use client"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
    ChartNoAxesCombined,
    ClipboardCheck,
    FileText,
    LayoutDashboard,
    PackageOpen,
    PackagePlus,
    Settings,
    ShoppingCart,
    SquareUser,
    Store,
    Truck,
    Users,
    Warehouse,
    type LucideIcon,
} from 'lucide-react'

/** The same icon each section has in the sidebar, so a page is recognisable at a glance */
const SECTION_ICONS: [prefix: string, icon: LucideIcon][] = [
    ['/dashboard', LayoutDashboard],
    ['/quotation-management', FileText],
    ['/customers', Users],
    ['/purchase-order', ShoppingCart],
    ['/job-ticket', ClipboardCheck],
    ['/dispatch-invoice', Truck],
    ['/inventory', Warehouse],
    ['/grn', PackagePlus],
    ['/issue-notes', PackageOpen],
    ['/suppliers', Store],
    ['/reports', ChartNoAxesCombined],
    ['/users', SquareUser],
    ['/settings', Settings],
]

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
}: PageTitleWithBreadcrumbProps) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const pathname = usePathname()
    const SectionIcon = SECTION_ICONS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1]

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const getGreeting = () => {
        const hour = currentTime.getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 18) return "Good Afternoon"
        return "Good Evening"
    }

    const formatDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })
    }

    if (isDashboard) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Dashboard</span>
                <h1 className="text-2xl font-bold tracking-tight text-[#14213D]">
                    {getGreeting()}
                </h1>
                <p className="text-sm text-muted-foreground">{formatDate()} · {formatTime()}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb) => (
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
            <div className="flex items-center gap-3">
                {SectionIcon && (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0FA] text-[#223F7A] ring-1 ring-[#D5DFF0]">
                        <SectionIcon className="size-5" aria-hidden />
                    </span>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-[#14213D]">{title}</h1>
            </div>
        </div>
    )
}

export default PageTitleWithBreadcrumb