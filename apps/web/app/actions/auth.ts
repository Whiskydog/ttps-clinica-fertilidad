"use server";

import {
  ApiErrorResponse,
  ApiResponse,
  ApiValidationErrorResponse,
  AuthToken,
  PatientResponse,
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

export async function signInPatient(data: {
  dni: string;
  password: string;
}): Promise<ApiResponse<AuthToken> | ApiErrorResponse> {
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

  return await response.json();
}
