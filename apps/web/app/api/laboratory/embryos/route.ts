import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const backendUrl = process.env.BACKEND_URL;
    const response = await fetch(
      `${backendUrl}/laboratory/embryos?page=${page}&limit=${limit}`,
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
        { error: "Failed to fetch embryos" },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (data.data && data.data.embryos && Array.isArray(data.data.embryos)) {
      return NextResponse.json({
        embryos: data.data.embryos,
        total: data.data.total,
      });
    } else if (data.embryos && Array.isArray(data.embryos)) {
      return NextResponse.json({ embryos: data.embryos, total: data.total });
    } else if (Array.isArray(data)) {
      return NextResponse.json({ embryos: data, total: data.length });
    } else {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching embryos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL;
    const response = await fetch(`${backendUrl}/laboratory/embryos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating embryo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
