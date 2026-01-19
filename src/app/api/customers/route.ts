
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {

        const apiUrl = API_ENDPOINTS.CUSTOMERS.LIST;

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
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
        console.error('Customer API Error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.json();
        const apiUrl = API_ENDPOINTS.CUSTOMERS.CREATE;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            cache: "no-store",
            credentials: "include",
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: "Failed to create customer" },
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
