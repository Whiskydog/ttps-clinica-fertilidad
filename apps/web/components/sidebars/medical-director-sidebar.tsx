import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Search,
  FileText,
  BarChart3,
  ClipboardList,
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
    path: "/medical-director",
    icon: LayoutDashboard,
  },
  {
    name: "Todos los Pacientes",
    path: "/medical-director/all-patients",
    icon: Users,
  },
  {
    name: "Búsqueda Global",
    path: "/medical-director/search",
    icon: Search,
  },
  {
    name: "Historias Clínicas",
    path: "/medical-director/medical-records",
    icon: FileText,
  },
  {
    name: "Estadísticas",
    path: "/medical-director/statistics",
    icon: BarChart3,
  },
  {
    name: "Reportes",
    path: "/medical-director/reports",
    icon: ClipboardList,
  },
];

export function MedicalDirectorSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      className="bg-blue-800 border-blue-700 md:w-64 w-[80vw]"
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
                    className="flex items-center gap-3 text-blue-100 hover:text-white hover:bg-blue-700"
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
