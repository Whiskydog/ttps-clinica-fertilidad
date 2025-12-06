"use client";

import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import {
  LayoutDashboard,
  Syringe,
  Egg,
  FlaskConical,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@repo/ui/sidebar";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface LabTechnicianLayoutClientProps {
  user: any;
  children: React.ReactNode;
}

export function LabTechnicianLayoutClient({
  user,
  children,
}: LabTechnicianLayoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
      router.push("/staff-login");
      router.refresh();
    });
  };

  const menuItems = [
    {
      name: "Resumen",
      path: "/laboratory-technician",
      icon: LayoutDashboard,
    },
    {
      name: "Registro de Punciones",
      path: "/laboratory-technician/punctures",
      icon: Syringe,
    },
    {
      name: "Ovocitos",
      path: "/laboratory-technician/oocytes",
      icon: Egg,
    },
    {
      name: "Fecundación / Embriones",
      path: "/laboratory-technician/embryos",
      icon: FlaskConical,
    },
    {
      name: "Banco de Donantes",
      path: "/laboratory-technician/donor-bank",
      icon: Database,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        className="bg-green-800 border-green-700 md:w-64 w-[80vw]"
        collapsible="icon"
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
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="bg-green-600 text-white px-4 md:px-8 py-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <SidebarTrigger className="text-white hover:bg-green-700" />
            <h1 className="text-base md:text-xl font-bold">
              Panel de Laboratorio
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium text-white">
                {user
                  ? `${user.firstName} ${user.lastName}`
                  : "Cargando..."}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isPending}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-green-700 text-sm md:text-base"
            >
              {isPending ? "Cerrando..." : "Cerrar Sesión"}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
