"use server";

import { cookies } from "next/headers";

export async function getDoctorAvailableSlots(params: {
  doctorId: number;
  date?: string; // YYYY-MM-DD
}) {
  const backendUrl = process.env.BACKEND_URL;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!backendUrl) {
    return { success: false, error: "BACKEND_URL no configurado" };
  }
  if (!sessionToken) {
    return { success: false, error: "No se encontró el token de sesión" };
  }
  if (!params?.doctorId) {
    return { success: false, error: "doctorId requerido" };
  }

  const qs = params.date ? `?date=${encodeURIComponent(params.date)}` : "";
  const url = `${backendUrl}/appointments/doctor/${params.doctorId}/available${qs}`;

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${sessionToken}` },
      cache: "no-store",
    });

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      return {
        success: false,
        error: res?.message ?? "Error al obtener slots disponibles",
      };
    }

    return { success: true, data: res };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
