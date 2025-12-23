'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface LinkMedicalOrdersParams {
    treatmentId: number;
    medicalOrderIds: number[];
}

export async function linkMedicalOrders({
    treatmentId,
    medicalOrderIds,
}: LinkMedicalOrdersParams) {
    const backendUrl = process.env.BACKEND_URL!;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) throw new Error('No se encontró el token de sesión');

    const response = await fetch(
        `${backendUrl}/treatments/${treatmentId}/medical-orders`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({ medicalOrderIds }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al vincular las órdenes médicas');
    }

    const data = await response.json();

    revalidatePath('/doctor/treatments/[id]', 'page');
    revalidatePath('/doctor/medical-orders/[id]', 'page');

    return { success: true, message: data.message };
}
