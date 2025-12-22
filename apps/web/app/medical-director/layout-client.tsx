"use client";

import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  PenTool,
  CreditCard,
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

interface MedicalDirectorLayoutClientProps {
  user: any;
  children: React.ReactNode;
}

export function MedicalDirectorLayoutClient({
  user,
  children,
}: MedicalDirectorLayoutClientProps) {
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
      name: "Dashboard",
      path: "/medical-director",
      icon: LayoutDashboard,
    },
    {
      name: "Pacientes",
      path: "/medical-director/patients",
      icon: Users,
    },
    {
      name: "Órdenes Médicas",
      path: "/medical-director/orders",
      icon: FileText,
    },
    {
      name: "Mi Firma",
      path: "/doctor/signature",
      icon: PenTool,
    },
    {
      name: "Auditoría",
      path: "/medical-director/audit",
      icon: Shield,
    },
    {
      name: "Pagos",
      path: "/medical-director/pagos",
      icon: CreditCard,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        className="bg-blue-800 border-blue-700 md:w-64 w-[80vw]"
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
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="bg-blue-600 text-white px-4 md:px-8 py-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <SidebarTrigger className="text-white hover:bg-blue-700" />
            <h1 className="text-base md:text-xl font-bold">
              CLÍNICA DE FERTILIDAD - DIRECCIÓN MÉDICA
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium">
                {user
                  ? `${user.firstName} ${user.lastName}`
                  : "Cargando..."}
              </p>
              <p className="text-sm text-blue-100">Director Médico</p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isPending}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-blue-700 text-sm md:text-base"
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
