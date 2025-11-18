"use server";

import { UpdateStudyResultSchema } from "@repo/contracts";
import { cookies } from "next/headers";

export async function updateStudyResult(payload: unknown) {
  console.log('[DEBUG SERVER ACTION] updateStudyResult - payload recibido:', JSON.stringify(payload));

  // Validate payload with Zod schema
  const validationResult = UpdateStudyResultSchema.safeParse(payload);

  if (!validationResult.success) {
    console.log('[DEBUG SERVER ACTION] Validación falló:', validationResult.error);
    return {
      success: false,
      error: validationResult.error.errors[0]?.message || "Datos inválidos",
    };
  }

  const data = validationResult.data;
  console.log('[DEBUG SERVER ACTION] Data validada:', JSON.stringify(data));

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
    const resp = await fetch(`${backendUrl}/medical-orders/study-results/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      const message = res?.message || `Error al actualizar resultado: ${resp.status}`;
      return {
        success: false,
        error: message,
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
