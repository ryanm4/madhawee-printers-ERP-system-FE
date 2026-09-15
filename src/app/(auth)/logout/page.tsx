"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAuth } from "@/lib/auth"
import axios from "axios"

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Call the logout API to revoke the refresh token on the backend
                await axios.post('/api/auth/logout', {}, { withCredentials: true })
            } catch (error) {
                // Ignore errors — we still want to clear client-side state
                console.error("Logout API error:", error)
            }

            // Clear client-side auth data (sessionStorage + cookies)
            clearAuth()

            // Redirect to login page
            router.push("/login")
        }

        performLogout()
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Logging out...</p>
        </div>
    )
}
