"use server";

import { UpdateDoctorNoteSchema } from "@repo/contracts";
import { cookies } from "next/headers";

export async function updateDoctorNote(payload: unknown) {
  // Validate payload with Zod schema
  const validationResult = UpdateDoctorNoteSchema.safeParse(payload);

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
    const resp = await fetch(`${backendUrl}/treatments/doctor-notes/${data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      const message = res?.message || `Error al actualizar nota: ${resp.status}`;
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
