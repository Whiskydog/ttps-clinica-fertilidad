"use server";

import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_URL;

export interface ChatbotMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export interface ChatbotPayload {
    messages: ChatbotMessage[];
}

export async function sendMessage(payload: ChatbotPayload) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
        throw new Error("No se encontró el token de sesión");
    }

    const url = `${backendUrl}/external/group6/preguntar`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(data?.message || "Error al comunicarse con el chatbot");
    }

    return data;
}
