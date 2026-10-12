import { API_ENDPOINTS } from '@/config/api-endpoints';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const formData = await request.json();
        const apiUrl = API_ENDPOINTS.REPORTS.CUSTOM_INVENTORY;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.value}`,
            },
            body: JSON.stringify(formData),
            cache: "no-store",
            credentials: "include",
        });

        if (!response.ok) {
            // Keep the backend's reason so the page can show what went wrong
            const failure = await response.json().catch(() => null);
            return NextResponse.json(
                {
                    message: [failure?.message || "Failed to generate inventory report", typeof failure?.error === "string" ? failure.error : ""]
                        .filter(Boolean)
                        .join(": "),
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        const responseData = Array.isArray(data) ? data : data.data;
        return NextResponse.json(responseData || [], { status: 201 });
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
