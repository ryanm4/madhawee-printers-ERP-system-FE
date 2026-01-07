"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        // Clear any auth tokens/session data here
        // For example: localStorage.removeItem('token')

        // Redirect to login page
        router.push("/login")
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Logging out...</p>
        </div>
    )
}
