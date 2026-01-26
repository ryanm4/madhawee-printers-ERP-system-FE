import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import company_logo from "../../../assets/Images/fvpns.png";
import login_page from "../../../assets/Images/login_page.jpg";
import { LoginForm } from "./loginForm";
export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
