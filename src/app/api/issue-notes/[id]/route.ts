
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  const { id } = await params;

  try {
    const apiUrl = API_ENDPOINTS.ISSUE_NOTES.GET(id);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('Issue Note Details API Error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  const { id } = await params;
  const formData = await request.json();

  try {
    const apiUrl = API_ENDPOINTS.ISSUE_NOTES.UPDATE(id);
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to update Issue Note" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  const { id } = await params;

  try {
    const apiUrl = API_ENDPOINTS.ISSUE_NOTES.DELETE(id);
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token?.value}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to delete Issue Note" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Issue Note deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return DELETE(request, { params });
}
