"use server";

import { cookies } from "next/headers";
import type { Treatment, ApiResponse } from "@repo/contracts";

export type TreatmentHistoryResponse = ApiResponse<Treatment[]>;

export async function getTreatmentHistory(): Promise<TreatmentHistoryResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}/treatments/patient/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    cache: "no-store",
  });

  const payload = await resp.json().catch(() => null);

  if (!resp.ok) {
    const message = payload?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }

  return payload;
}
