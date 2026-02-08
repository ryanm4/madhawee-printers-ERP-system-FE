import * as z from "zod";

export const loginSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address format"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/[0-9]/, "Password must contain at least one number"),
});