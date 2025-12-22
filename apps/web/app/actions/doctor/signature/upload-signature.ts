"use server";

import { cookies } from "next/headers";

export async function uploadSignature(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, error: "No autenticado" };
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/doctors/me/signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Error al subir la firma",
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error uploading signature:", error);
    return {
      success: false,
      error: "Error al subir la firma",
    };
  }
}
