"use server";

import { CreateTreatmentResponseDtoType } from "@repo/contracts";
import { cookies } from "next/headers";

export async function createTreatment(
  medicalHistoryId: number,
  initialObjective: string,
  medicalOrderIds?: number[]
) {
  const backendUrl = process.env.BACKEND_URL as string;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) throw new Error("No se encontró el token de sesión");

  const resp = await fetch(`${backendUrl}/treatments/${medicalHistoryId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      initial_objective: initialObjective,
      medicalOrderIds,
    }),
  });

  const payload: CreateTreatmentResponseDtoType = await resp
    .json()
    .catch(() => {
      throw new Error("Error al parsear la respuesta del servidor");
    });

  if (!resp.ok) {
    const message = payload?.message || `Request failed: ${resp.status}`;
    throw new Error(message);
  }

  return payload;
}
