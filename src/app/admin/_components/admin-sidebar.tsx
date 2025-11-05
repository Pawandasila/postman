"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  BarChart3,
  Shield,
  Database,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "API Calls",
    icon: Activity,
    href: "/admin/api_calls",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer shrink-0">
            <Image
              src={"/logo/logo.png"}
              alt="Postman Logo"
              width={100}
              height={100}
              quality={100}
              className="h-14 w-14 object-contain"
            />
          <div className="flex flex-col">
            <span className="font-semibold text-lg">PostBoy</span>
            <span className="text-xs text-muted-foreground font-medium">
              Admin Panel
            </span>
          </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`group transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-primary/10 to-chart-2/10 border-l-2 border-primary text-primary font-medium shadow-sm"
                          : "hover:bg-accent/50 hover:translate-x-1"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            isActive ? "text-primary" : ""
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="hover:bg-accent/50 hover:translate-x-1 transition-all"
                >
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="hover:bg-accent/50 hover:translate-x-1 transition-all"
                >
                  <Link
                    href="/admin/database"
                    className="flex items-center gap-3"
                  >
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 bg-gradient-to-t from-muted/20 to-transparent">
        <div className="space-y-2">
          <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground">
              System Status
            </p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
              All Systems Operational
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <Link href="/">
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin Panel
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
