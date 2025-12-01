import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientDni = searchParams.get("patientDni");

  if (!patientDni) {
    return NextResponse.json(
      { error: "patientDni is required" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    const response = await fetch(
      `${backendUrl}/laboratory/treatments?patientDni=${patientDni}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch treatments" },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return NextResponse.json(data.data);
    } else if (Array.isArray(data)) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
