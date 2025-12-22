'use server';

import { cookies } from "next/headers";

// Types
export interface ObraSocial {
    id: number;
    nombre: string;
    sigla: string;
    cobertura: number;
}

export interface Payment {
    id: number;
    grupo: number;
    monto_total: number;
    id_paciente: number;
    estado_obra_social: string;
    estado_paciente: string;
    obra_social: ObraSocial;
}

// Helper to get headers
async function getHeaders() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get("session")?.value;

    return {
        "Content-Type": "application/json",
        ...(sessionValue ? { Authorization: `Bearer ${sessionValue}` } : {}),
    };
}

// Fetch Obras Sociales
export async function getObrasSociales() {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${process.env.BACKEND_URL}/payments/obras-sociales`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (!res.ok) return [];


        const payload = await res.json();
        console.log("Obras sociales payload:", payload);

        return payload.data.data || [];
    } catch (error) {
        console.error('Error fetching obras sociales:', error);
        return [];
    }
}

// Fetch Group Payments
export async function getGroupPayments() {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${process.env.BACKEND_URL}/payments/group-payments`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (!res.ok) return [];

        const payload = await res.json();
        console.log("Group payments payload:", payload);

        return payload.data.pagos || [];
    } catch (error) {
        console.error('Error fetching group payments:', error);
        return [];
    }
}

// Register Payment
export async function registerPayment(payload: {
    id_grupo: number;
    id_pago: number;
    obra_social_pagada: boolean;
    paciente_pagado: boolean;
}) {
    try {
        const headers = await getHeaders();
        // Assuming backend url
        const res = await fetch(`${process.env.BACKEND_URL}/payments/register`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        return { success: res.ok, data };
    } catch (error) {
        console.error('Error registering payment:', error);
        return { success: false, error: 'Failed to register payment' };
    }
}
