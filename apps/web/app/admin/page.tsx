"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { UsersManagementClient } from "@/components/admin/users-management-client";
import { getStaffUsers } from "@/app/actions/admin/get-staff-users";

export default function UsersManagementPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["staff-users", page, perPage],
    queryFn: () => getStaffUsers(page, perPage),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{error?.message || "Error al cargar usuarios"}</p>
      </div>
    );
  }

  return <UsersManagementClient initialData={response.data} />;
}
