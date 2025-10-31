"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  FileText,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export default function MedicalDirectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    firstName: "Carlos",
    lastName: "Martínez",
    title: "Director Médico",
  };
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/medical-director", icon: LayoutDashboard },
    {
      name: "Todos los Pacientes",
      path: "/medical-director/all-patients",
      icon: Users,
    },
    { name: "Búsqueda Global", path: "/medical-director/search", icon: Search },
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

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64 bg-blue-800 border-r border-blue-700">
        <div className="px-4 pt-6">
          <h2 className="text-blue-100 text-lg font-bold mb-4">Dashboard</h2>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className="flex items-center gap-3 text-blue-100 hover:text-white hover:bg-blue-700 rounded-md px-3 py-2"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 text-white px-4 md:px-8 py-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-base md:text-xl font-bold">
              CLÍNICA DE FERTILIDAD - DIRECCIÓN MÉDICA
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-blue-100">{user.title}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white text-white px-3 py-2 hover:bg-blue-700 text-sm md:text-base"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
