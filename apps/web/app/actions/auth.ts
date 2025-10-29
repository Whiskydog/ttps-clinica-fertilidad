"use server";

import { createSession } from "@/app/lib/session";
import {
  ApiErrorResponse,
  ApiResponse,
  ApiValidationErrorResponse,
  AuthToken,
  PatientResponse,
  PatientSignIn,
  PatientSignUp,
} from "@repo/contracts";

export async function signUp(
  data: PatientSignUp
): Promise<ApiResponse<PatientResponse> | ApiValidationErrorResponse> {
  const response = await fetch(`${process.env.BACKEND_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
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
