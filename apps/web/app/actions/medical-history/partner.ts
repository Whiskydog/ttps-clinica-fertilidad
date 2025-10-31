"use server";

import { cookies } from "next/headers";
import { UpsertPartnerPayloadSchema } from "@repo/contracts";

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

export async function upsertPartner(payload: unknown) {
  const obj = UpsertPartnerPayloadSchema.parse(payload);
  const { medicalHistoryId, partnerData, gynecologicalHistory } = obj;

  if (partnerData.biologicalSex === "female") {
    const hasAnyField = !!(
      gynecologicalHistory?.menarcheAge ||
      gynecologicalHistory?.cycleRegularity ||
      gynecologicalHistory?.cycleDurationDays ||
      gynecologicalHistory?.bleedingCharacteristics ||
      gynecologicalHistory?.gestations ||
      gynecologicalHistory?.births ||
      gynecologicalHistory?.abortions ||
      gynecologicalHistory?.ectopicPregnancies ||
      gynecologicalHistory?.partnerData
    );
    if (!hasAnyField) {
      throw new Error(
        "Si la pareja es femenina, debe incluir antecedentes ginecológicos"
      );
    }
  }

  return forwardToBackend("/medical-history/partner", {
    medicalHistoryId,
    partnerData,
    gynecologicalHistory: gynecologicalHistory ?? null,
  });
}
