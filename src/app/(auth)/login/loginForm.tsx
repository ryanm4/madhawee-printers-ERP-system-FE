"use client"
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
type LoginFormValues = z.infer<typeof loginSchema>


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const baseDefaultValues: LoginFormValues = {
    email: "",
    password: "",
  }
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: baseDefaultValues,

  })

  const onSubmit = async () => {
    router.push("/dashboard")


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
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>

            <div className="relative">
              <Input
                id="password"
                placeholder="Enter Your Password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
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
            <Button type="submit">Login</Button>
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
