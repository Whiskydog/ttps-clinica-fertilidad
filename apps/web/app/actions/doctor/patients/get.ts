"use server";

import { cookies } from "next/headers";

interface GetPatientsParams {
  page?: number;
  limit?: number;
  dni?: string;
}

export async function getPatients(params: GetPatientsParams = {}) {
  const backendUrl = process.env.BACKEND_URL as string;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  const url = new URL(`${backendUrl}/patients`);
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.dni) url.searchParams.set("dni", params.dni);

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(url, {
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
