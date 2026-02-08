// lib/auth.ts

import Cookies from 'js-cookie';
import { GET_ALL_USER } from "@/modules/users/types";

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};

/**
 * Get authentication token from cookies
 */
export function getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
}

/**
 * Set authentication token in cookies
 */
export function setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
}

/**
 * Remove authentication token from cookies
 */
export function removeToken(): void {
    Cookies.remove(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Get user from cookies
 */
export function getUser(): GET_ALL_USER | null {
    const userStr = Cookies.get(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr) as GET_ALL_USER;
    } catch {
        return null;
    }
}

/**
 * Set user in cookies
 */
export function setUser(user: GET_ALL_USER): void {
    Cookies.set(USER_KEY, JSON.stringify(user), COOKIE_OPTIONS);
}

/**
 * Remove user from cookies
 */
export function removeUser(): void {
    Cookies.remove(USER_KEY);
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