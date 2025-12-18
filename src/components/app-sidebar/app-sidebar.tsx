"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ClipboardCheck,
  Command,
  FileText,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings,
  Settings2,
  ShoppingCart,
  SquareTerminal,
  SquareUser,
  Truck,
  Users,
  Warehouse,
} from "lucide-react"



import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

// This is sample data.


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
      url: "/quotation",
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
      url: "/inventory-management",
    },
    {
      title: "CRM Module",
      icon: Users,
      url: "/crm",
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

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">Blah blach</span>
            <span className="truncate text-xs">kill em with kindness</span>
          </div>

        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
