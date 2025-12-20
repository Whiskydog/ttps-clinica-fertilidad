import { ApiErrorResponse } from "@repo/contracts";

const backendUrl = process.env.NEXT_PUBLIC_API_URL as string;

export interface ChatbotMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export interface ChatbotPayload {
    patientId: number;
    patientName: string;
    birthDate: string;
    gender: string;
    messages: ChatbotMessage[];
}

export async function sendMessage(payload: ChatbotPayload) {
    const url = new URL(`${backendUrl}/external/group6/preguntar`);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    console.log('Chatbot Response:', data);
    if (!res.ok) {
        throw new Error(data?.message || "Error al comunicarse con el chatbot");
    }

    // The API returns the direct response from the external service
    // Adjust based on actual response structure if needed, usually it's { answer: string } or similar
    return data;
}
