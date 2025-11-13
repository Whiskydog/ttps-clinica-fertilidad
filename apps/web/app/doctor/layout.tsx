import { getUser } from "@/app/lib/dal";
import { DoctorLayoutClient } from "./layout-client";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return <DoctorLayoutClient user={user}>{children}</DoctorLayoutClient>;
}
