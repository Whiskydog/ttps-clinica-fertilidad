"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Beaker,
  BarChart3,
  Settings,
} from "lucide-react";
import { signOut as signOutAction, getMe } from "@/app/actions/auth";
import type { User } from "@repo/contracts";

const menuItems = [
  { name: "Dashboard", path: "/doctor", icon: LayoutDashboard },
  { name: "Mis Pacientes", path: "/doctor/patients", icon: Users },
  { name: "Órdenes Médicas", path: "/doctor/orders", icon: FileText },
  { name: "Seguimientos", path: "/doctor/follow-ups", icon: Activity },
  { name: "Laboratorio", path: "/doctor/laboratory", icon: Beaker },
  { name: "Estadísticas", path: "/doctor/statistics", icon: BarChart3 },
  { name: "Configuración", path: "/doctor/settings", icon: Settings },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((data) => data && setUser(data))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await signOutAction();
    } catch (err) {
      console.error("Error during logout:", err);
    }
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-green-800 border-r border-green-700">
        <div className="px-4 pt-6">
          <h2 className="text-white text-lg font-bold mb-4">Dashboard</h2>
          <nav>
            <ul className="space-y-2">
              {menuItems.map(({ name, path, icon: Icon }) => (
                <li key={path}>
                  <Link
                    href={path}
                    className="flex items-center gap-3 text-green-100 hover:text-white hover:bg-green-700 rounded-md px-3 py-2"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-green-600 text-white px-4 md:px-8 py-4 shadow-md flex items-center justify-between">
          <h1 className="text-base md:text-xl font-bold">
            CLÍNICA DE FERTILIDAD - DASHBOARD MÉDICO
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium">
                Dr. {user?.firstName ?? ""} {user?.lastName ?? ""}
              </p>
              <p className="text-sm text-green-100">
                {user?.role?.name ?? "Médico"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white text-white px-3 py-2 hover:bg-green-700 text-sm md:text-base"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
