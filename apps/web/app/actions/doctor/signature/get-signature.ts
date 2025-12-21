"use server";

import { cookies } from "next/headers";

export async function getSignature() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, error: "No autenticado" };
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/doctors/me/signature`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Error al obtener la firma",
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error getting signature:", error);
    return {
      success: false,
      error: "Error al obtener la firma",
    };
  }
}
