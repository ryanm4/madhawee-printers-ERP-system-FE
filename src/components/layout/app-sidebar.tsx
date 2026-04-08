"use client";

import * as React from "react";
import {
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  ClipboardCheck,
  Truck,
  Warehouse,
  Users,
  SquareUser,
  Settings,
  ChartNoAxesCombined,
} from "lucide-react";
import { NavSecondary } from "./nav-secondary";
import Image from "next/image";
import company_logo from "@/assets/Images/company_logo.jpeg";

const data = {
  user: {
    name: "Admin User",
    email: "admin@madhawee.com",
    avatar: "/avatars/admin.png",
  },
  navGroups: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Sales & CRM",
      items: [
        {
          title: "Quotations",
          url: "/quotation-management",
          icon: FileText,
        },
        {
          title: "Customers / Supplier",
          url: "/customers",
          icon: Users,
        },
      ],
    },
    {
      title: "Production",
      items: [
        {
          title: "Purchase Orders",
          url: "/purchase-order",
          icon: ShoppingCart,
        },
        {
          title: "Job Tickets",
          url: "/job-ticket",
          icon: ClipboardCheck,
        },
        {
          title: "Dispatch & Invoice",
          url: "/dispatch-invoice",
          icon: Truck,
        },
      ],
    },
    {
      title: "Inventory",
      items: [
        {
          title: "Inventory and Stock",
          icon: Warehouse,
          url: "/inventory",
          items: [
            {
              title: "Inventory List",
              url: "/inventory",
            },
            {
              title: "GRN",
              url: "/inventory/grn",
            },
            {
              title: "Issue Notes",
              url: "/inventory/issue-notes",
            },
          ],
        },
      ],
    },
    {
      title: "System",
      items: [
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
        {
          title: "Settings",
          icon: Settings,
          url: "/settings",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center ">
                  <Image
                    src={company_logo}
                    alt="Madhawee Printers"
                    width={24}
                    height={24}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Madhawee Printers
                  </span>
                  <span className="truncate text-xs">v1.0.5</span>
                </div>
                <IconInnerShadowTop className="ml-auto size-4 opacity-50" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {data.navGroups.map((group) => (
          <SidebarGroup key={group.title} className="py-1">
            <SidebarGroupLabel className="h-5 mb-0 px-2 text-xs font-semibold">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
