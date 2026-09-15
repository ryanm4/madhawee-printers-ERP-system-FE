// lib/auth.ts — Tier 2 Auth: Access Token in sessionStorage + Refresh Token in HttpOnly Cookie
import Cookies from 'js-cookie';
import { GET_ALL_USER } from "@/modules/users/types";

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

// Legacy cookie key — used only for middleware to read the access token
const AUTH_COOKIE_KEY = 'auth_token';

/**
 * Decode JWT payload to extract user info (name, role, user_id).
 * Does NOT verify signature — that's done server-side.
 */
function decodeJWTPayload(token: string): { user_id?: number; name?: string; user_role?: string } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Get access token from sessionStorage (client-side) or cookie fallback (for middleware)
 */
export function getToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || Cookies.get(AUTH_COOKIE_KEY) || undefined;
}

/**
 * Set access token — stores in both sessionStorage and a cookie.
 * The cookie allows the middleware (server-side) to read it for route protection.
 * The actual token is a signed JWT — users cannot tamper with the role inside it.
 */
export function setToken(token: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    // Also set as a cookie so middleware can read it for route protection
    Cookies.set(AUTH_COOKIE_KEY, token, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

/**
 * Remove access token
 */
export function removeToken(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    Cookies.remove(AUTH_COOKIE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Get user info. Tries sessionStorage first, then falls back to decoding the JWT.
 * This ensures user data is available even in new tabs or after sessionStorage is cleared.
 */
export function getUser(): GET_ALL_USER | null {
    if (typeof window === 'undefined') return null;

    // 1. Try sessionStorage first (fastest)
    const userStr = sessionStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr) as GET_ALL_USER;
        } catch {
            // fall through to JWT decode
        }
    }

    // 2. Fallback: decode the JWT to get user info
    const token = getToken();
    if (token) {
        const payload = decodeJWTPayload(token);
        if (payload && payload.user_role) {
            const user = {
                user_id: payload.user_id,
                name: payload.name || '',
                user_role: payload.user_role,
            } as unknown as GET_ALL_USER;

            // Re-populate sessionStorage so next call is instant
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
        }
    }

    return null;
}

/**
 * Set user in sessionStorage (display purposes only)
 */
export function setUser(user: GET_ALL_USER): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    // Remove the old plain-text user cookie if it exists
    Cookies.remove('user');
}

/**
 * Remove user from sessionStorage
 */
export function removeUser(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(USER_KEY);
    }
    Cookies.remove('user');
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth(): void {
    removeToken();
    removeUser();
}

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}