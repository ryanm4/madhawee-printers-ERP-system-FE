"use client";
import axios from "axios";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/modules/login/validation";
import z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginApi } from "@/modules/login/api";
import { setToken, setUser } from "@/lib/auth";
import { getDefaultRoute } from "@/lib/permissions";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LoginFormValues = z.infer<typeof loginSchema>;

const SIGN_IN_FAILED =
  "That username and password don't match. Check them and try again.";
const SERVER_UNREACHABLE =
  "The ERP server isn't responding. Check your connection and try again.";

/** Prefer the server's own reason (e.g. a disabled account); never show raw HTTP errors */
const signInErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return SERVER_UNREACHABLE;
    const serverMessage = error.response.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;
  }
  return SIGN_IN_FAILED;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseDefaultValues: LoginFormValues = {
    name: "",
    password: "",
  };
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: baseDefaultValues,
  });
  const { errors } = form.formState;

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      setIsLoading(true);
      const response = await loginApi.login(data);

      // Save access token to sessionStorage + cookie, user info to sessionStorage
      const token = response.data.accessToken || response.data.token || '';
      setToken(token);
      setUser(response.data.user);

      toast("Signed in");
      router.push(getDefaultRoute(response.data.user?.user_role));
    } catch (error) {
      console.error("Login failed:", error);
      setError(signInErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <h1 className="text-[2rem] leading-tight font-bold tracking-[-0.02em] text-[#1A2233]">
        Sign in
      </h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-pretty text-[#5B6474]">
        Use your Madhawee ERP username and password.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-7">
        <FieldGroup className="gap-5">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Couldn&apos;t sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Field className="gap-2">
            <FieldLabel htmlFor="name">Username</FieldLabel>
            <Input
              id="name"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              disabled={isLoading}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="h-11 rounded-[4px] text-[0.9375rem] md:text-[0.9375rem]"
              {...form.register("name")}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </Field>

          <Field className="gap-2">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="h-11 rounded-[4px] pr-12 text-[0.9375rem] md:text-[0.9375rem]"
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-[#5B6474] hover:text-[#1A2233]"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </Field>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 rounded-[4px] text-[0.9375rem] font-semibold"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
