import "server-only";

import { decrypt } from "@/app/lib/session";
import { UserResponse } from "@repo/contracts";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.sub) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.sub };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session || !session.isAuth) {
    return null;
  }

  const cookieHeader = (await headers()).get("Cookie") ?? "";

  const res = await fetch(`${process.env.BACKEND_URL}/me`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    return null;
  }

  const payload: UserResponse = await res.json();
  if (payload.statusCode !== 200) {
    return null;
  }

  return payload.data;
});
