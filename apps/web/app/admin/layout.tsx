"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = { firstName: "Admin", lastName: "Sistema" };
  const handleLogout = () => {
    // TODO: implement logout
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-gray-900 font-medium">
            Panel de Administración - {user.firstName} {user.lastName}
          </h1>
          <button
            onClick={handleLogout}
            className="inline-block rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}
