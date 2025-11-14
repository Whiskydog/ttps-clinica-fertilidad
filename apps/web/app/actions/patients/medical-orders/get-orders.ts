"use server";

import { cookies } from "next/headers";
import type { MedicalOrder, MedicalOrderStatus, ApiResponse } from "@repo/contracts";

export type MedicalOrdersResponse = ApiResponse<MedicalOrder[]>;

export async function getMedicalOrders(
  status?: MedicalOrderStatus
): Promise<MedicalOrdersResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const url = new URL(`${backendUrl}/medical-orders/patient`);
  if (status) {
    url.searchParams.set("status", status);
  }

  const resp = await fetch(url.toString(), {
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
