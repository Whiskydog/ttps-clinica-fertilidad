"use client";

import {
  ApiErrorResponse,
  ApiResponse,
  AppointmentDetail,
  DoctorsResponse,
} from "@repo/contracts";

const backendUrl = process.env.NEXT_PUBLIC_API_URL as string;

export async function getDoctors() {
  const url = new URL(`${backendUrl}/doctors`);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  const payload: DoctorsResponse | ApiErrorResponse = await res
    .json()
    .catch(() => null);
  if (!res.ok) {
    throw new Error(payload.message);
  }

  return (payload as DoctorsResponse).data;
}

export async function getDoctorAvailableSlots(doctorId: number) {
  const url = new URL(
    `${backendUrl}/appointments/doctor/${doctorId}/available`
  );

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  const payload: ApiResponse<AppointmentDetail[]> | ApiErrorResponse = await res
    .json()
    .catch(() => null);
  if (!res.ok) {
    throw new Error(payload.message);
  }

  return (payload as ApiResponse<AppointmentDetail[]>).data;
}
