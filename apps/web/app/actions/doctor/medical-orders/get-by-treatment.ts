"use server";

import { cookies } from "next/headers";

export async function getMedicalOrdersByTreatment(treatmentId: number) {
  const backendUrl = process.env.BACKEND_URL as string;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(
    `${backendUrl}/medical-orders?treatmentId=${treatmentId}`,
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
  // Handle wrapped response from backend interceptor
  return payload?.data !== undefined ? payload.data : payload;
}
