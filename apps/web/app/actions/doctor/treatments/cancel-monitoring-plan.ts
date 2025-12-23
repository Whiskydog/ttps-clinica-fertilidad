"use server";

import { cookies } from "next/headers";

export async function cancelMonitoringPlan(planId: number) {
  const backendUrl = process.env.BACKEND_URL;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return { success: false, error: "No autenticado" };
  }

  try {
    const resp = await fetch(`${backendUrl}/monitoring-plans/${planId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      const json = await resp.json().catch(() => null);
      return {
        success: false,
        error: json?.message ?? "Error al cancelar el monitoreo",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
