"use client"

import * as React from "react"
import {
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"
import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, FileText, ShoppingCart, ClipboardCheck, Truck, Warehouse, Users, SquareUser, Settings, ChartNoAxesCombined } from "lucide-react"
import { NavSecondary } from "./nav-secondary"
import Image from "next/image"
import company_logo from "@/assets/Images/company_logo.jpeg"

const data = {

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Quotations",
      url: "/quotation-management",
      icon: FileText,
    },
    {
      title: "Purchase Orders Management",
      url: "/purchase-order",
      icon: ShoppingCart,
    },
    {
      title: "Job Ticket Management",
      url: "/job-ticket",
      icon: ClipboardCheck,
    },
    {
      title: "Dispatch and Invoice Management",
      url: "/dispatch-invoice",
      icon: Truck,
    },
    {
      title: "Inventory Management",
      icon: Warehouse,
      url: "/inventory",
    },
    {
      title: "Customer Module",
      icon: Users,
      url: "/customers",
    },
    {
      title: "Users",
      icon: SquareUser,
      url: "/users",
    },
    {
      title: "Reports",
      icon: ChartNoAxesCombined,
      url: "/reports",
    },

  ],



}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center    text-sidebar-primary-foreground">
                  <Image src={company_logo} alt="Madhawee Printers" width={24} height={24} className="object-contain" priority />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Madhawee Printers</span>
                  <span className="truncate text-xs">ERP System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
