"use server";

import { cookies } from "next/headers";

export async function deleteSignature() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { success: false, error: "No autenticado" };
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/doctors/me/signature`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Error al eliminar la firma",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting signature:", error);
    return {
      success: false,
      error: "Error al eliminar la firma",
    };
  }
}
