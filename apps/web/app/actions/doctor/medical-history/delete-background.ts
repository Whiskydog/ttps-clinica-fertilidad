"use server";

import { cookies } from "next/headers";

export async function deleteBackground(id: number) {
  if (!id || typeof id !== "number") {
    return {
      success: false,
      error: "ID inválido",
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
    const resp = await fetch(`${backendUrl}/medical-history/background/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: "no-store",
    });

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      const message = res?.message || `Error al eliminar antecedente: ${resp.status}`;
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
