"use server";

import { cookies } from "next/headers";

export async function finalizeMonitoringPlans(payload: {
  treatmentId: number;
  rows: {
    planId: number;
    selectedSlotId?: number;
    isOvertime: boolean;
  }[];
}) {
  const backendUrl = process.env.BACKEND_URL;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return { success: false, error: "No autenticado" };
  }

  try {
    const resp = await fetch(`${backendUrl}/monitoring-plans/finalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await resp.json().catch(() => null);

    if (!resp.ok) {
      return {
        success: false,
        error: json?.message ?? "Error al finalizar monitoreos",
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
