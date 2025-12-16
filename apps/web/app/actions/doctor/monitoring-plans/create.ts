"use server";

import { cookies } from "next/headers";
import { CreateMonitoringPlansSchema } from "@repo/contracts";

export async function createMonitoringPlans(payload: unknown) {
  const result = CreateMonitoringPlansSchema.safeParse(payload);

  if (!result.success) {
    const message =
      result.error?.issues?.[0]?.message ??
      "Datos inválidos en planificación de monitoreos";

    return {
      success: false,
      error: message,
    };
  }

  const backendUrl = process.env.BACKEND_URL;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return {
      success: false,
      error: "No se encontró el token de sesión",
    };
  }

  try {
    const resp = await fetch(`${backendUrl}/monitoring-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(result.data),
      cache: "no-store",
    });

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      return {
        success: false,
        error: res?.message ?? "Error al crear planificación de monitoreos",
      };
    }

    return {
      success: true,
      data: res,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
