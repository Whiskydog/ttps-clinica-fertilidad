import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Beaker,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/sidebar";

const menuItems = [
  {
    name: "Dashboard",
    path: "/doctor",
    icon: LayoutDashboard,
  },
  {
    name: "Mis Pacientes",
    path: "/doctor/patients",
    icon: Users,
  },
  {
    name: "Órdenes Médicas",
    path: "/doctor/orders",
    icon: FileText,
  },
  {
    name: "Seguimientos",
    path: "/doctor/follow-ups",
    icon: Activity,
  },
  {
    name: "Laboratorio",
    path: "/doctor/laboratory",
    icon: Beaker,
  },
  {
    name: "Estadísticas",
    path: "/doctor/statistics",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    path: "/doctor/settings",
    icon: Settings,
  },
];

export function DoctorSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      className="bg-green-800 border-green-700 md:w-64 w-[80vw]"
      collapsible="icon"
      {...props}
    >
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.path}
                    className="flex items-center gap-3 text-green-100 hover:text-white hover:bg-green-700"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
