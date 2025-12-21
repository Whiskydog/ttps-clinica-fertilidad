"use client";

import {
  ApiErrorResponse,
  ApiResponse,
  AppointmentDetail,
  BookAppointment,
} from "@repo/contracts";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export async function bookAppointment(
  appointmentDetails: BookAppointment
): Promise<ApiResponse<null> | ApiErrorResponse> {
  const res = await fetch(`${backendUrl}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(appointmentDetails),
  });

  if (!res.ok) {
    const errorPayload: ApiErrorResponse = await res.json().catch(() => null);
    throw new Error(errorPayload.message);
  }

  const payload: ApiResponse<null> = await res.json().catch(() => null);

  return payload;
}

export async function getAvailableAppointmentSlots() {
  const res = await fetch(`${backendUrl}/appointments/available`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorPayload: ApiErrorResponse = await res.json().catch(() => null);
    throw new Error(errorPayload.message);
  }

  const payload: ApiResponse<AppointmentDetail[]> = await res.json().catch(() => null);

  return payload.data;
}
