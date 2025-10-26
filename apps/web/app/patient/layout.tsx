"use client";

import { Button } from "@repo/ui/button";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    firstName: "María",
    lastName: "González",
  };

  const handleLogout = () => {
    console.log("Cerrar sesión");
    // TODO: Implement logout logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-gray-900 font-medium">
            Bienvenida, {user.firstName} {user.lastName}
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}
