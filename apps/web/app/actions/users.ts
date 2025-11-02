"use server";

import {
  AdminUserCreate,
  ApiErrorResponse,
  ApiResponse,
  ApiValidationErrorResponse,
  UserResponse,
} from "@repo/contracts";
import { headers } from "next/headers";

export async function createStaffUser(
  data: AdminUserCreate
): Promise<
  ApiResponse<UserResponse> | ApiValidationErrorResponse | ApiErrorResponse
> {
  const cookieHeader = (await headers()).get("Cookie") ?? "";

  const response = await fetch(`${process.env.BACKEND_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}
