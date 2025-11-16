import { getUser } from "@/app/lib/dal";
import { RoleCode } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user || user.role.code !== RoleCode.PATIENT) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-gray-900 font-medium">
            Bienvenida, {user.firstName} {user.lastName}
          </h1>
          <Link href="/logout">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cerrar Sesión
            </Button>
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}
