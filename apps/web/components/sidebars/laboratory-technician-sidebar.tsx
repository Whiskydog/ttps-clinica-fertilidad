import * as React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Syringe,
  Egg,
  FlaskConical,
  Database,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@repo/ui/sidebar';

const menuItems = [
  {
    name: 'Resumen',
    path: '/laboratory-technician',
    icon: LayoutDashboard,
  },
  {
    name: 'Registro de Punciones',
    path: '/laboratory-technician/punctures',
    icon: Syringe,
  },
  {
    name: 'Ovocitos',
    path: '/laboratory-technician/oocytes',
    icon: Egg,
  },
  {
    name: 'Fecundación / Embriones',
    path: '/laboratory-technician/embryos',
    icon: FlaskConical,
  },
  {
    name: 'Banco de Donantes',
    path: '/laboratory-technician/donor-bank',
    icon: Database,
  },
];

export function LaboratoryTechnicianSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      className="bg-white border-gray-200 md:w-64 w-[80vw]"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="p-6 border-b border-gray-200">
        <p className="text-sm text-gray-600">Usuario:</p>
        <p className="font-medium text-gray-900">Operador de Laboratorio</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.path}
                    className="flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
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
