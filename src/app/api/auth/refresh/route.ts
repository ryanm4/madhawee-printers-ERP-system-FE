// app/api/auth/refresh/route.ts — Proxies refresh token request to backend
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const backendUrl = process.env.MADHAWEE_PRINTERS_ERP_BASE_URL;
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { message: 'No refresh token' },
                { status: 401 }
            );
        }

        const response = await fetch(`${backendUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refresh_token=${refreshToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Token refresh failed' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Build response with the new access token
        const res = NextResponse.json({
            accessToken: data.accessToken,
        });

        // Forward the Set-Cookie header from backend (new rotated refresh_token)
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            res.headers.set('set-cookie', setCookieHeader);
        }

        return res;
    } catch (error) {
        console.error('❌ Refresh API Error:', error);
        return NextResponse.json(
            { message: 'Token refresh failed' },
            { status: 500 }
        );
    }
}
