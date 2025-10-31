"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Syringe,
  Egg,
  FlaskConical,
  Database,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LabTechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = { firstName: "Operador", lastName: "de Laboratorio" };
  const router = useRouter();

  const handleLogout = () => {
    // TODO: implement server-side logout; for now redirect to login
    router.push("/login");
  };

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

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
        <div className="px-4 pt-6">
          <h2 className="text-gray-900 text-lg font-bold mb-4">
            Panel de Laboratorio
          </h2>
          <nav>
            <ul className="space-y-2">
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

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-base md:text-xl font-bold text-gray-900">
              Panel de Laboratorio
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm md:text-base px-3 py-2"
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
