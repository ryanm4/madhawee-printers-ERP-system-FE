"use client"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/modules/login/validation"
import z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import company_logo from "@/assets/Images/company_logo.jpeg"
import { loginApi } from "@/modules/login/api"
import { setToken, setUser } from "@/lib/auth"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type LoginFormValues = z.infer<typeof loginSchema>


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseDefaultValues: LoginFormValues = {
    email: "",
    password: "",
  }
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: baseDefaultValues,

  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      setIsLoading(true);
      const response = await loginApi.login(data);

      // Save token and user to cookies
      setToken(response.data.token);
      setUser(response.data.user);

      toast("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "Invalid email or password";

      if (error.response) {
        // Handle API error response
        const data = error.response.data;
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-20 w-auto items-center justify-center">
                <Image src={company_logo} alt="madhawee printers" width={200} height={80} className="h-full w-auto object-contain" />
              </div>
              <span className="sr-only">Madhawee Printers</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Madhawee Printers</h1>

          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              disabled={isLoading}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </Field>
          <Field>
            {/* <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div> */}

            <div className="relative">
              <Input
                id="password"
                placeholder="Enter Your Password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                disabled={isLoading}
                {...form.register("password")}
              />

              <Button
                type="button"
                variant="ghost"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto px-2 py-1"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </Field>


        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
