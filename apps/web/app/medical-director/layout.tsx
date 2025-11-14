import { getUser } from "@/app/lib/dal";
import { MedicalDirectorLayoutClient } from "./layout-client";

export default async function MedicalDirectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <MedicalDirectorLayoutClient user={user}>
      {children}
    </MedicalDirectorLayoutClient>
  );
}
