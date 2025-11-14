"use server";

import { cookies } from "next/headers";
import type { StaffUsersListResponse } from "@repo/contracts";

export async function getStaffUsers(
  page: number = 1,
  perPage: number = 10
): Promise<StaffUsersListResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  
    const url = new URL(`${process.env.BACKEND_URL}/admin/users`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("perPage", perPage.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
