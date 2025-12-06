"use server";

import { cookies } from "next/headers";

export async function getMedicalOrdersForDoctor(page = 1) {
  const backendUrl = process.env.BACKEND_URL!;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}/medical-orders?page=${page}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    cache: "no-store",
  });

  const payload = await resp.json();

  if (!resp.ok) {
    throw new Error(
      payload?.message || `Error al obtener órdenes médicas: ${resp.status}`
    );
  }

  return {
    orders: payload.data.data,
    pagination: payload.data.pagination,
  };
}
