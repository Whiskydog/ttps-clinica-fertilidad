"use server";

import { cookies } from "next/headers";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

interface GeneratePdfResult {
  success: boolean;
  data?: {
    pdfUrl: string;
    generatedAt: string;
  };
  error?: string;
}

export async function generateProtocolPdf(
  treatmentId: number,
  formData: FormData
): Promise<GeneratePdfResult> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return {
        success: false,
        error: "No hay sesión activa",
      };
    }

    const response = await fetch(
      `${backendUrl}/treatments/${treatmentId}/protocol/generate-pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        pdfUrl: data.pdfUrl,
        generatedAt: data.generatedAt,
      },
    };
  } catch (error) {
    console.error("Error generating protocol PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
