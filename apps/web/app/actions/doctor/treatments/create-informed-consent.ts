"use server";

import { CreateInformedConsentSchema } from "@repo/contracts";
import { cookies } from "next/headers";

export async function createInformedConsent(payload: unknown) {
  console.log("Payload received:", JSON.stringify(payload, null, 2));
  // Validate payload with Zod schema
  const validationResult = CreateInformedConsentSchema.safeParse(payload);

  if (!validationResult.success) {
    console.error("Validation errors:", JSON.stringify(validationResult.error.flatten(), null, 2));
    return {
      success: false,
      error: validationResult.error.flatten().fieldErrors,
    };
  }

  const data = validationResult.data;

  const backendUrl = process.env.BACKEND_URL;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return {
      success: false,
      error: "No se encontró el token de sesión",
    };
  }

  try {
    const resp = await fetch(`${backendUrl}/treatments/informed-consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const res = await resp.json().catch(() => null);

    if (!resp.ok) {
      const message = res?.message || `Error al crear consentimiento: ${resp.status}`;
      return {
        success: false,
        error: message,
      };
    }

    return {
      success: true,
      data: res?.data || res,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
