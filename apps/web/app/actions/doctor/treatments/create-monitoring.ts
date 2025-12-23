"use server";

import { CreateMonitoringSchema } from "@repo/contracts";
import { cookies } from "next/headers";

export async function createMonitoring(treatmentId: number, payload: unknown) {
  
  const validationResult = CreateMonitoringSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Datos inválidos",
    };
  }

  const data = validationResult.data;

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
    const resp = await fetch(
      `${backendUrl}/treatments/${treatmentId}/monitorings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          monitoringDate: data.monitoringDate,
          dayNumber: data.dayNumber,
          follicleCount: data.follicleCount,
          follicleSize: data.follicleSize,
          estradiolLevel: data.estradiolLevel,
          observations: data.observations,
          monitoringPlanId: data.monitoringPlanId,
        }),
        cache: "no-store",
      }
    );

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      return {
        success: false,
        error: res?.message || `Error al crear monitoreo (${resp.status})`,
      };
    }

    return {
      success: true,
      data: res?.data || res,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
