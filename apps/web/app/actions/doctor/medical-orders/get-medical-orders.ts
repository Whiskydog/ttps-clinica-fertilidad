"use server";

import { cookies } from "next/headers";

interface GetMedicalOrdersParams {
    patientId?: string;
    treatmentId?: string;
    status?: string;
    category?: string;
    doctorId?: string;
    unassigned?: string;
    page?: string;
    limit?: string;
}

export async function getMedicalOrders(params: GetMedicalOrdersParams) {
    const backendUrl = process.env.BACKEND_URL!;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) throw new Error("No se encontró el token de sesión");

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value);
        }
    });

    const resp = await fetch(`${backendUrl}/medical-orders?${queryParams.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
    });

    const payload = await resp.json();

    if (!resp.ok) {
        throw new Error(
            payload?.message || `Error al obtener órdenes médicas: ${resp.status}`
        );
    }

    return payload;
}
