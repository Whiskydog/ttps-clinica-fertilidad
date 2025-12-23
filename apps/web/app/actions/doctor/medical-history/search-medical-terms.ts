"use server";

import { cookies } from "next/headers";

export interface MedicalTermsSearchResult {
  rows: string[];
  total_count: number;
}

export interface SearchMedicalTermsParams {
  query: string;
  page?: number;
  limit?: number;
}

export async function searchMedicalTerms({
  query,
  page = 1,
  limit = 10,
}: SearchMedicalTermsParams): Promise<{
  success: boolean;
  data?: MedicalTermsSearchResult;
  error?: string;
}> {
  if (query.length < 3) {
    return {
      success: true,
      data: { rows: [], total_count: 0 },
    };
  }

  const backendUrl = process.env.BACKEND_URL as string;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  try {
    const url = new URL(`${backendUrl}/external/group2-medical-terms/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Error al buscar términos: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // La API puede devolver la data directamente o envuelta en { statusCode, message, data }
    const responseData = data.data ?? data;
    const rows = Array.isArray(responseData.rows) ? responseData.rows : [];
    const totalCount = responseData.total_count ?? 0;

    return {
      success: true,
      data: {
        rows,
        total_count: totalCount,
      },
    };
  } catch (error) {
    console.error("[searchMedicalTerms] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
