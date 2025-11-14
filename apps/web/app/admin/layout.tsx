import { getUser } from "@/app/lib/dal";
import { StaffLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <StaffLayoutClient user={user} role="Administrador">
      {children}
    </StaffLayoutClient>
  );
}
