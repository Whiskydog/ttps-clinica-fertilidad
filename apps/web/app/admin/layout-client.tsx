"use client";

import { signOut } from "@/app/actions/auth";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface StaffLayoutClientProps {
  user: any;
  role: string;
  children: React.ReactNode;
}

export function StaffLayoutClient({
  user,
  role,
  children,
}: StaffLayoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
      router.push("/staff-login");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-gray-900 font-medium">
            Panel de {role} -{" "}
            {user ? `${user.firstName} ${user.lastName}` : "Cargando..."}
          </h1>
          <Button
            onClick={handleLogout}
            disabled={isPending}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {isPending ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}
