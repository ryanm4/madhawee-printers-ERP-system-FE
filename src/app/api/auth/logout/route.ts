// app/api/auth/logout/route.ts — Proxies logout request to backend to revoke refresh token
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const backendUrl = process.env.MADHAWEE_PRINTERS_ERP_BASE_URL;
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (backendUrl && refreshToken) {
            // Tell backend to revoke the refresh token
            await fetch(`${backendUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `refresh_token=${refreshToken}`,
                },
                cache: 'no-store',
            }).catch(() => {
                // Ignore errors — we still want to clear client-side state
            });
        }

        // Clear the refresh_token cookie on the client
        const res = NextResponse.json({ message: 'Logged out successfully' });
        res.cookies.set('refresh_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });
        res.cookies.set('auth_token', '', {
            path: '/',
            maxAge: 0,
        });

        return res;
    } catch (error) {
        console.error('❌ Logout API Error:', error);
        // Still clear cookies even if backend call fails
        const res = NextResponse.json({ message: 'Logged out' });
        res.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
        res.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
        return res;
    }
}
