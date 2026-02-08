
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {

        const apiUrl = API_ENDPOINTS.QUOTATIONS.LIST;

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
            return NextResponse.json(
                { message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data.data);
    } catch (error) {
        console.error('Quotation API Error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const formData = await request.json();
        const apiUrl = API_ENDPOINTS.QUOTATIONS.CREATE;

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
