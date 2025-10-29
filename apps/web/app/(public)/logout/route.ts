import { clearSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function GET() {
  await clearSession();
  redirect("/");
}
