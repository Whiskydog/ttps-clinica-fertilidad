"use server";

import { CreateFenotypeSchema } from "@repo/contracts";

export async function createFenotype(payload: unknown) {
  const validationResult = CreateFenotypeSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      success: false,
      error:
        validationResult.error.errors[0]?.message ||
        "Datos de fenotipo inválidos",
    };
  }

  const data = validationResult.data;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/medical-history/fenotype`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || "Error al crear fenotipo",
      };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear fenotipo",
    };
  }
}
