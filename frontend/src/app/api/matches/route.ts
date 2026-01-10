import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityName = searchParams.get("city_name");
  const requestId = searchParams.get("request_id");

  console.log("📨 API Route /api/matches called");
  console.log(`   City: ${cityName}`);
  console.log(`   Request ID: ${requestId}`);

  if (!cityName || !requestId) {
    console.log("❌ Missing parameters");
    return NextResponse.json(
      { detail: "Missing city_name or request_id" },
      { status: 400 }
    );
  }

  const backendUrl = process.env.BACKEND_URL;
  console.log(`   Backend URL (env): ${backendUrl || "NOT SET"}`);

  if (!backendUrl) {
    console.error("❌ BACKEND_URL environment variable not set!");
    return NextResponse.json(
      { detail: "Backend URL not configured" },
      { status: 500 }
    );
  }

  const targetUrl = `${backendUrl}/api/matches?city_name=${encodeURIComponent(cityName)}&request_id=${encodeURIComponent(requestId)}`;
  console.log(`   → Proxying to: ${targetUrl}`);

  try {
    const startTime = Date.now();
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const duration = Date.now() - startTime;
    console.log(`   ✅ Backend responded: ${response.status} (${duration}ms)`);

    const data = await response.json();

    if (!response.ok) {
      console.log(`   ⚠️  Backend returned error: ${response.status}`);
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`   ✅ Successfully proxied request`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Proxy error:");
    console.error(`   URL: ${targetUrl}`);
    console.error(`   Error:`, error);
    return NextResponse.json(
      { detail: "Failed to proxy request to backend" },
      { status: 500 }
    );
  }
}
