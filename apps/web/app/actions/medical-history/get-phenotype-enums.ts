"use server";

export interface PhenotypeEnumCategory {
  values: string[];
  label: string;
  description: string;
}

export interface PhenotypeEnumsResponse {
  success: boolean;
  enums: {
    eye_color: PhenotypeEnumCategory;
    hair_color: PhenotypeEnumCategory;
    hair_type: PhenotypeEnumCategory;
    complexion: PhenotypeEnumCategory;
    ethnicity: PhenotypeEnumCategory;
    gamete_type: PhenotypeEnumCategory;
  };
  metadata: {
    last_updated: string;
    total_categories: number;
    api_version: string;
  };
}

export async function getPhenotypeEnums(): Promise<{
  success: boolean;
  data?: PhenotypeEnumsResponse;
  error?: string;
}> {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return {
        success: false,
        error: "BACKEND_URL no está definido",
      };
    }

    const res = await fetch(
      `${backendUrl}/external/group7/gamete-bank/enums`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || "Error al obtener enums de fenotipos",
      };
    }

    const result = await res.json();
    // El backend envuelve la respuesta en { data: ... } con EnvelopeInterceptor
    const responseData = result.data || result;
    return { success: true, data: responseData };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener enums de fenotipos",
    };
  }
}
