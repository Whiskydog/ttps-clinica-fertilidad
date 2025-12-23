"use server";

import { UpdateFenotypeSchema } from "@repo/contracts";
import { cookies } from "next/headers";

export async function updateFenotype(payload: unknown) {
  const validationResult = UpdateFenotypeSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      success: false,
      error:
        validationResult.error.issues[0]?.message ||
        "Datos de fenotipo inválidos",
    };
  }

  const data = validationResult.data;

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return {
        success: false,
        error: "BACKEND_URL no está definido",
      };
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) {
      return {
        success: false,
        error: "No se encontró el token de sesión",
      };
    }

    const res = await fetch(
      `${backendUrl}/medical-history/fenotype/${data.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || "Error al actualizar fenotipo",
      };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar fenotipo",
    };
  }
}
