import * as z from "zod";

export const userSchema = z.object({
    user_role: z.string().min(1, "User type is required"),
    name: z.string().min(1, "Name is required"),
    email: z
        .string()
        .min(1, "Email is required")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid email address format"
        ),
    password: z.string().min(1, "Password is required"),
});

export const editUserSchema = z.object({
    user_role: z.string().min(1, "User type is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address format"),
    password: z.string().optional(),
});
