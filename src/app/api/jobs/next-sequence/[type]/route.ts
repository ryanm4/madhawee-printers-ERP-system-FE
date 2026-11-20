import { API_ENDPOINTS } from '@/config/api-endpoints';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ type: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const { type } = await context.params;
        const apiUrl = API_ENDPOINTS.JOB_TICKETS.NEXT_SEQUENCE(type);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.value}`,
            },
            cache: "no-store",
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Job Next Sequence API Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
