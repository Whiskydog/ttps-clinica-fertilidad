"use server";

import { cookies } from "next/headers";

export type MedicalHistoryResponse = {
  data: unknown;
  message?: string;
};

export async function getMedicalHistory(): Promise<MedicalHistoryResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}/medical-history/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    cache: "no-store",
  });

  const payload = await resp.json().catch(() => null);

  console.log(JSON.stringify(payload))
  
  if (!resp.ok) {
    const message = payload?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }

  return {
    data: payload?.data ?? null,
    message: payload?.message,
  };
}
