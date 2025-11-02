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

export async function toggleUserStatus(
  userId: number,
  isActive: boolean
): Promise<ApiResponse<UserResponse> | ApiErrorResponse> {
  const cookieHeader = (await headers()).get("Cookie") ?? "";

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/users/${userId}/toggle-status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ isActive }),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error al cambiar el estado del usuario",
      error: "Internal Server Error",
    };
  }
}

export async function deleteUser(
  userId: number
): Promise<ApiResponse<void> | ApiErrorResponse> {
  const cookieHeader = (await headers()).get("Cookie") ?? "";

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    if (response.status === 204) {
      return {
        statusCode: 204,
        message: "Usuario eliminado exitosamente",
        data: undefined,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error al eliminar el usuario",
      error: "Internal Server Error",
    };
  }
}
