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
import { LayoutDashboard, FileText, ShoppingCart, ClipboardCheck, Truck, Warehouse, Users, SquareUser, Settings } from "lucide-react"
import { NavSecondary } from "./nav-secondary"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      title: "Settings",
      icon: Settings,
      url: "/settings",
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
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
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Madhawee Printers</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
