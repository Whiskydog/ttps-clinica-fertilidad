import { ApiErrorResponse, UsersListResponse } from "@repo/contracts";
import { cookies } from "next/headers";

export async function getStaffUsers(
  page: number = 1,
  perPage: number = 10
): Promise<UsersListResponse | ApiErrorResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      statusCode: 500,
      message: "Error al obtener usuarios",
      error: "Internal Server Error",
    };
  }
}
