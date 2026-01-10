import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityName = searchParams.get("city_name");
  const requestId = searchParams.get("request_id");

  if (!cityName || !requestId) {
    return NextResponse.json(
      { detail: "Missing city_name or request_id" },
      { status: 400 }
    );
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Backend URL not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${backendUrl}/api/matches?city_name=${encodeURIComponent(cityName)}&request_id=${encodeURIComponent(requestId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to proxy request to backend" },
      { status: 500 }
    );
  }
}
