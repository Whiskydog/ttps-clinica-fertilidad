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

const menuItems = [
  { name: "Dashboard", path: "/doctor", icon: LayoutDashboard },
  { name: "Mis Pacientes", path: "/doctor/patients", icon: Users },
  { name: "Órdenes Médicas", path: "/doctor/orders", icon: FileText },
  { name: "Seguimientos", path: "/doctor/follow-ups", icon: Activity },
  { name: "Laboratorio", path: "/doctor/laboratory", icon: Beaker },
  { name: "Estadísticas", path: "/doctor/statistics", icon: BarChart3 },
  { name: "Configuración", path: "/doctor/settings", icon: Settings },
];

export function DoctorSidebar() {
  return (
    <aside className="hidden md:block w-64 bg-green-800 border-r border-green-700">
      <div className="px-4 pt-6">
        <h2 className="text-white text-lg font-bold mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="flex items-center gap-3 text-green-100 hover:text-white hover:bg-green-700 rounded-md px-3 py-2"
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
  );
}
