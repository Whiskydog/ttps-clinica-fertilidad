import {
  ApiErrorResponse,
  PatientDebt,
  PatientDebtResponse,
} from "@repo/contracts";

const backendUrl = process.env.NEXT_PUBLIC_API_URL as string;

export async function getOwnDebt(): Promise<PatientDebt> {
  const url = new URL(`${backendUrl}/payments/own-debt`);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  const payload: PatientDebtResponse | ApiErrorResponse = await res
    .json()
    .catch(() => null);
  if (!res.ok) {
    throw new Error(payload.message);
  }

  return (payload as PatientDebtResponse).data;
}
