// app/api/inventory/[id]/route.ts
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


// GET single inventory item by ID
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const { id } = await context.params;
        const apiUrl = API_ENDPOINTS.JOB_TICKETS.GET(id);

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
        return NextResponse.json(data.data);
    } catch (error) {
        console.error("Job Ticket GET by ID API Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT - Update inventory item
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const { id } = await context.params;
        const body = await request.json();
        const apiUrl = API_ENDPOINTS.JOB_TICKETS.UPDATE(id);

        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.value}`,
            },
            body: JSON.stringify(body),
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
        console.error("Job Ticket UPDATE API Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Delete inventory item
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    try {
        const { id } = await context.params; // ✅ Await the params
        const apiUrl = API_ENDPOINTS.JOB_TICKETS.DELETE(id);

        const response = await fetch(apiUrl, {
            method: "DELETE",
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

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Inventory DELETE API Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}