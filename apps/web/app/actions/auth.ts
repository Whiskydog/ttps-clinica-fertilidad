"use server";

import { createSession, clearSession } from "@/app/lib/session";
import { cookies } from "next/headers";
import {
  ApiErrorResponse,
  ApiResponse,
  ApiValidationErrorResponse,
  AuthToken,
  PatientResponse,
  PatientSignIn,
  PatientSignUp,
  StaffSignIn,
} from "@repo/contracts";

// Registro de paciente
export async function signUp(
  data: PatientSignUp
): Promise<ApiResponse<PatientResponse> | ApiValidationErrorResponse> {
  const resp = await fetch(`${process.env.BACKEND_URL}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return resp.json();
}

// Login de paciente
export async function signInPatient(
  data: PatientSignIn
): Promise<ApiResponse<AuthToken> | ApiErrorResponse> {
  const resp = await fetch(`${process.env.BACKEND_URL}/auth/sign-in/patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await resp.json();
  if (resp.ok) {
    await createSession((payload as ApiResponse<AuthToken>).data.accessToken);
  }
  return payload;
}

// Login de staff
export async function signInStaff(
  data: StaffSignIn
): Promise<ApiResponse<AuthToken> | ApiErrorResponse> {
  const resp = await fetch(`${process.env.BACKEND_URL}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await resp.json();
  if (resp.ok) {
    await createSession((payload as ApiResponse<AuthToken>).data.accessToken);
  }
  return payload;
}

// Logout
export async function signOut(): Promise<ApiResponse<{
  message: string;
}> | null> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return null;

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;

  if (!sessionValue) {
    await clearSession();
    return null;
  }

  try {
    const resp = await fetch(`${backendUrl}/auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionValue}`,
      },
      cache: "no-store",
    });

    await clearSession();
    const payload = await resp.json().catch(() => null);
    return payload as ApiResponse<{ message: string }> | null;
  } catch {
    await clearSession();
    return null;
  }
}

// Obtener datos del usuario actual
export async function getMe() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return null;

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;

  try {
    const resp = await fetch(`${backendUrl}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionValue}`,
      },
      cache: "no-store",
    });
    if (!resp.ok) return null;

    const data = await resp.json().catch(() => null);
    return data?.data ?? null;
  } catch {
    return null;
  }
}
