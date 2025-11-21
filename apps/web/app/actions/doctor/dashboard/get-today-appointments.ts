"use server";

import { cookies } from "next/headers";
import { TodayAppointment } from "@repo/contracts";

export async function getTodayAppointments(): Promise<{
  data: TodayAppointment[];
}> {
  const backendUrl = process.env.BACKEND_URL as string;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    throw new Error("No se encontró el token de sesión");
  }

  const resp = await fetch(
    `${backendUrl}/doctor/dashboard/today-appointments`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: "no-store",
    }
  );

  const payload = await resp.json().catch(() => null);

  if (!resp.ok) {
    const message = payload?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }

  return { data: payload.data || payload };
}
