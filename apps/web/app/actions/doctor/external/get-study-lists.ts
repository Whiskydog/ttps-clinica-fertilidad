"use server";

import { cookies } from "next/headers";

export interface StudyLists {
  semen: string[];
  hormonales: string[];
  ginecologicos: string[];
  prequirurgicos: string[];
}

export async function getStudyLists(): Promise<{ data: StudyLists }> {
  const backendUrl = process.env.BACKEND_URL as string;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  // Los endpoints son públicos, pero incluimos auth por consistencia
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  // Fetch all study lists in parallel
  const [semenResp, hormonalesResp, ginecologicosResp, prequirurgicosResp] =
    await Promise.all([
      fetch(`${backendUrl}/external/group1-studies/semen`, {
        method: "GET",
        headers,
        cache: "no-store",
      }),
      fetch(`${backendUrl}/external/group1-studies/hormonales`, {
        method: "GET",
        headers,
        cache: "no-store",
      }),
      fetch(`${backendUrl}/external/group1-studies/ginecologicos`, {
        method: "GET",
        headers,
        cache: "no-store",
      }),
      fetch(`${backendUrl}/external/group1-studies/prequirurgicos`, {
        method: "GET",
        headers,
        cache: "no-store",
      }),
    ]);

  // Parse responses
  const [semenData, hormonalesData, ginecologicosData, prequirurgicosData] =
    await Promise.all([
      semenResp.json().catch(() => []),
      hormonalesResp.json().catch(() => []),
      ginecologicosResp.json().catch(() => []),
      prequirurgicosResp.json().catch(() => []),
    ]);

  // DEBUG: Log raw responses
  console.log("[DEBUG] Study Lists Raw Responses:", {
    semen: { status: semenResp.status, data: semenData },
    hormonales: { status: hormonalesResp.status, data: hormonalesData },
    ginecologicos: { status: ginecologicosResp.status, data: ginecologicosData },
    prequirurgicos: { status: prequirurgicosResp.status, data: prequirurgicosData },
  });

  // Extract study names from responses
  // The external API may return different formats, so we handle both array and object responses
  const extractStudies = (data: any): string[] => {
    if (Array.isArray(data)) {
      return data.map((item: any) =>
        typeof item === 'string' ? item : item.name || item.nombre || String(item)
      );
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((item: any) =>
        typeof item === 'string' ? item : item.name || item.nombre || String(item)
      );
    }
    return [];
  };

  const result = {
    semen: extractStudies(semenData),
    hormonales: extractStudies(hormonalesData),
    ginecologicos: extractStudies(ginecologicosData),
    prequirurgicos: extractStudies(prequirurgicosData),
  };

  // DEBUG: Log final result
  console.log("[DEBUG] Study Lists Final Result:", result);

  return { data: result };
}
