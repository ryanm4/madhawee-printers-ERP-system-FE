"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAuth } from "@/lib/auth"

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        // Clear auth cookies
        clearAuth()

        // Redirect to login page
        router.push("/login")
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Logging out...</p>
        </div>
    )
}
