import { API_ENDPOINTS } from '@/config/api-endpoints';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const formData = await request.json();
        const apiUrl = API_ENDPOINTS.REPORTS.CREATE;

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
            return NextResponse.json(
                { message: "Failed to create quotations" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}