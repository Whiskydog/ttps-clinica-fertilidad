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
  { name: "Reportes", path: "/medical-director/reports", icon: ClipboardList },
];

export function MedicalDirectorSidebar() {
  return (
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
  );
}
