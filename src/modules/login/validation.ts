import * as z from "zod";

export const loginSchema = z.object({
  name: z.string().min(1, "User name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  // .regex(/[0-9]/, "Password must contain at least one number"),
});
