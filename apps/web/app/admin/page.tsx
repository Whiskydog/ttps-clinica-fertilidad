import { UsersManagementClient } from "./components/users-management-client";
import { getStaffUsers } from "./lib/get-staff-users";

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: { page?: string; perPage?: string };
}) {
  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page || "1");
  const perPage = parseInt(searchParamsResolved.perPage || "10");

  const response = await getStaffUsers(page, perPage);

  if ("error" in response) {
    // Error al obtener usuarios
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{response.message}</p>
      </div>
    );
  }

  return <UsersManagementClient initialData={response.data} />;
}
