"use server";

import { cookies } from "next/headers";
import type { MedicalOrderDetail, ApiResponse } from "@repo/contracts";

export type MedicalOrderDetailResponse = ApiResponse<MedicalOrderDetail | null>;

export async function getMedicalOrderDetail(
  orderId: number
): Promise<MedicalOrderDetailResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}/medical-orders/patient/${orderId}`, {
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
