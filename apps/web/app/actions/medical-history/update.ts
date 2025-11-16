"use server";

import { UpdateMedicalHistorySchema } from "@repo/contracts";
import { cookies } from "next/headers";

export async function updateMedicalHistory(payload: unknown) {
  const obj = UpdateMedicalHistorySchema.parse(payload);
  if (typeof obj?.id !== "number") {
    throw new Error("id must be a number");
  }

  const backendUrl = process.env.BACKEND_URL;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}/medical-history/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(obj),
    cache: "no-store",
  });

  const res = await resp.json().catch(() => null);
  if (!resp.ok) {
    const message = res?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }
  return res;
}
