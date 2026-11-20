// app/api/login/route.ts — Tier 2 Auth: Proxies login and forwards refresh token cookie
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, password } = body;

    // Validate input
    if (!name || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Call backend API
    const apiUrl = API_ENDPOINTS.AUTH.LOGIN;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, password }),
      cache: "no-store",
      credentials: "include",
    });

    // Handle backend errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json(
        {
          message:
            errorData.message || `Authentication failed: ${response.status}`,
          error: "Unable to sign in. Please check your username and password.",
        },
        { status: response.status }
      );
    }

    // Parse backend response
    const data = await response.json();

    // Log successful login in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Login successful:", {
        name,
        user: data.user || data.data?.user,
      });
    }

    // Build response — forward accessToken and user info
    const res = NextResponse.json({
      accessToken: data.accessToken || data.token || data.data?.token,
      user: data.user || data.data?.user,
      message: data.message || "Login successful",
    });

    // Forward the Set-Cookie header from backend (contains the HttpOnly refresh_token)
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error("❌ Login API Error:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
