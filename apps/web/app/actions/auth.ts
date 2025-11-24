"use server";

import { clearSession, createSession } from "@/app/lib/session";
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

export async function signUp(
  data: PatientSignUp
): Promise<ApiResponse<PatientResponse> | ApiValidationErrorResponse | ApiErrorResponse> {

  const response = await fetch(`${process.env.BACKEND_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();

  // If response is not ok, return the error response
  if (!response.ok) {
    return payload as ApiValidationErrorResponse | ApiErrorResponse;
  }

  return payload as ApiResponse<PatientResponse>;
}

export async function signInPatient(
  data: PatientSignIn
): Promise<ApiResponse<AuthToken> | ApiErrorResponse> {
  const response = await fetch(
    `${process.env.BACKEND_URL}/auth/sign-in/patient`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const payload = await response.json();
  if (response.ok) {
    const authResponse = payload as ApiResponse<AuthToken>;
    await createSession(authResponse.data.accessToken);
    return authResponse;
  }

  return payload as ApiErrorResponse;
}

export async function signInStaff(
  data: StaffSignIn
): Promise<ApiResponse<AuthToken> | ApiErrorResponse> {
  const response = await fetch(`${process.env.BACKEND_URL}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (response.ok) {
    const authResponse = payload as ApiResponse<AuthToken>;
    await createSession(authResponse.data.accessToken);
    return authResponse;
  }

  return payload as ApiErrorResponse;
}

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
