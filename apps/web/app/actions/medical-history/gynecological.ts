"use server";

import { cookies } from "next/headers";
import { GynecologicalHistorySchema } from "@repo/contracts";

async function forwardToBackend(path: string, body: unknown) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL no está definido");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await resp.json().catch(() => null);
  if (!resp.ok) {
    const message = payload?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function upsertGynecological(payload: unknown) {
  const obj = payload as any;
  if (typeof obj?.medicalHistoryId !== "number") {
    throw new Error("medicalHistoryId must ser un número");
  }

  const gyne = GynecologicalHistorySchema.parse(obj.gynecologicalHistory);

  return forwardToBackend("/medical-history/gynecological", {
    medicalHistoryId: obj.medicalHistoryId,
    gynecologicalHistory: gyne,
  });
}
