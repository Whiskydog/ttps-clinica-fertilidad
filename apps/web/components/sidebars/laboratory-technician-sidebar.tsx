import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Syringe,
  Egg,
  FlaskConical,
  Database,
} from "lucide-react";

const menuItems = [
  { name: "Resumen", path: "/laboratory-technician", icon: LayoutDashboard },
  {
    name: "Registro de Punciones",
    path: "/laboratory-technician/punctures",
    icon: Syringe,
  },
  { name: "Ovocitos", path: "/laboratory-technician/oocytes", icon: Egg },
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

export function LaboratoryTechnicianSidebar() {
  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
      <div className="px-4 pt-6">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">Usuario:</p>
          <p className="font-medium text-gray-900">Operador de Laboratorio</p>
        </div>
        <nav>
          <ul className="px-2 pt-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
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
