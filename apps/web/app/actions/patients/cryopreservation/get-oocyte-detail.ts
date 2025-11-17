"use server";

import { cookies } from "next/headers";
import type { OocyteDetail, ApiResponse } from "@repo/contracts";

export type OocyteDetailResponse = ApiResponse<OocyteDetail | null>;

export async function getOocyteDetail(
  productId: string
): Promise<OocyteDetailResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(
    `${backendUrl}/laboratory/patient/oocyte/${productId}`,
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
    console.log(JSON.stringify(payload,null,2));
    const message = payload?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }

  return payload;
}
