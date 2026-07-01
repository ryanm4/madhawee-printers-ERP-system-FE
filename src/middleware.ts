import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDefaultRoute, isRouteAllowedForUser } from '@/lib/permissions'

function getUserRoleFromRequest(request: NextRequest): string | undefined {
    const userCookie = request.cookies.get('user')?.value
    if (!userCookie) return undefined

    try {
        const user = JSON.parse(userCookie) as { user_role?: string }
        return user.user_role
    } catch {
        return undefined
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const userRole = getUserRoleFromRequest(request)
    const { pathname } = request.nextUrl

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
    if (token && !isPublicRoute && !isRouteAllowedForUser(pathname, userRole)) {
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
