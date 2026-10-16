import Image from "next/image";
import { LoginActivityPanel } from "@/components/auth/login-activity-panel";
import { LoginForm } from "./loginForm";

/* 45/55 split from 860px; below that it is the form alone. */
export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-white min-[860px]:grid-cols-[45fr_55fr]">
      <main className="flex flex-col px-6 py-10 sm:px-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-[380px] flex-col gap-8">
            <Image
              src="/images/madhawee_logo.svg"
              alt="Madhawee Printers (Pvt) Ltd"
              width={260}
              height={38}
              priority
              unoptimized
              className="-ml-2 h-auto w-[200px]"
            />
            <LoginForm />
          </div>
        </div>

        <p className="text-sm text-[#5B6474]">© {new Date().getFullYear()} Madhawee Printers (Pvt) Ltd</p>
      </main>

      <LoginActivityPanel />
    </div>
  );
}
