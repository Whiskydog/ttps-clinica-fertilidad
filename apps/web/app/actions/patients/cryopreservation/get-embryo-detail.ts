"use server";

import { cookies } from "next/headers";
import type { EmbryoDetail, ApiResponse } from "@repo/contracts";

export type EmbryoDetailResponse = ApiResponse<EmbryoDetail | null>;

export async function getEmbryoDetail(
  productId: string
): Promise<EmbryoDetailResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(
    `${backendUrl}/laboratory/patient/embryo/${productId}`,
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

  return payload;
}
