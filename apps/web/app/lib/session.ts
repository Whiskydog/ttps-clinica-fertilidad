import "server-only";

import { AuthPayload } from "@repo/contracts";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function decrypt(
  session: string | undefined = ""
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify<AuthPayload>(session, encodedKey);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(accessToken: string): Promise<void> {
  const payload = await decrypt(accessToken);
  if (payload) {
    const expiresAt = new Date(payload.exp * 1000);
    const cookieStore = await cookies();

    cookieStore.set({
      name: "session",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
