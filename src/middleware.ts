import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDefaultRoute, isRouteAllowedForUser } from '@/lib/permissions'

/**
 * Decode JWT payload (base64) to extract user_role.
 * This does NOT verify the signature — that's done by the backend.
 * The middleware only needs the role for route-level access control.
 * Tampering with the JWT will fail at the backend signature check.
 */
function decodeJWTPayload(token: string): { user_role?: string; name?: string; user_id?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        // Handle base64url encoding
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const { pathname } = request.nextUrl

    // Decode role from the JWT payload (tamper-proof — backend verifies signature)
    let userRole: string | undefined
    if (token) {
        const payload = decodeJWTPayload(token)
        userRole = payload?.user_role
    }

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/logout']

    // check if the route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If the user is on a public route and has a token, redirect to their home page
    if (isPublicRoute && token) {
        if (pathname === '/login') {
            return NextResponse.redirect(new URL(getDefaultRoute(userRole), request.url))
        }
    }

    // If the user is not on a public route and doesn't have a token, redirect to login
    if (!isPublicRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Restrict USER role to allowed pages only
    if (token && !isPublicRoute && userRole && !isRouteAllowedForUser(pathname, userRole)) {
        return NextResponse.redirect(new URL(getDefaultRoute(userRole), request.url))
    }

    return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
}
