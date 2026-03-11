// app/api/auth/login/route.ts
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
        });

        // Handle backend errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            return NextResponse.json(
                {
                    message: errorData.message || `Authentication failed: ${response.status}`,
                    error: "Unable to sign in. Please check your username and password."
                },
                { status: response.status }
            );
        }

        // Parse backend response
        const data = await response.json();

        // Log successful login in development
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Login successful:', {
                name,
                user: data.user || data.data?.user,
            });
        }

        // Return response to client
        // Adjust based on your backend response structure
        return NextResponse.json({
            token: data.token || data.access_token || data.data?.token,
            user: data.user || data.data?.user,
            message: data.message || "Login successful",
        });

    } catch (error) {
        console.error("❌ Login API Error:", error);

        return NextResponse.json(
            {
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}