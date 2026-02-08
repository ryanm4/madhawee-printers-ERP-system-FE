import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const { pathname } = request.nextUrl

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/logout']

    // check if the route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If the user is on a public route and has a token, redirect to dashboard
    if (isPublicRoute && token) {
        // If user is already logged in, redirect away from login page to dashboard
        if (pathname === '/login') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // If the user is not on a public route and doesn't have a token, redirect to login
    if (!isPublicRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        // Optional: Add redirect param to return to the original page after login
        // loginUrl.searchParams.set('redirect', pathname) 
        return NextResponse.redirect(loginUrl)
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
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
