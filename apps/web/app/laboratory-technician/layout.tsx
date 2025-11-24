import { getUser } from "@/app/lib/dal";
import { LabTechnicianLayoutClient } from "./layout-client";

export default async function LabTechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <LabTechnicianLayoutClient user={user}>
      {children}
    </LabTechnicianLayoutClient>
  );
}
